const portfinder = require('portfinder')
const Koa = require('koa')
const log = require('../utils/log')('api')
const rt = require('../models/runtime')
const wallet = require('./wallet')
const ipfs = require('./ipfs')
const evt = require('../utils/events')
const { Draft, Planet, FollowingArticle } = require('../models')
const Jimp = require('jimp')

//API for mobile
class ApiServer {
  async init() {
    const port = await portfinder.getPortPromise({
      port: 16789, // minimum port
      stopPort: 16799,
      host: '0.0.0.0',
    })
    log.debug('api server init called, and got port', port)
    this.apiPort = port
    this.ipAddr = this.getIpAddress()
    await this.startListen()
    this.mdnsStart()
  }

  getPlanetUrl() {
    return `scbrf://${this.getIpAddress()}:${this.apiPort}`
  }

  getIpAddress() {
    const { networkInterfaces } = require('os')
    const nets = networkInterfaces()
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
          return net.address
        }
      }
    }
  }

  mdnsStart() {
    var mdns = require('multicast-dns')()
    mdns.on('query', (query) => {
      if (query.questions[0] && query.questions[0].name.startsWith('_scarborough-api._tcp')) {
        log.debug(`querying ${query.questions[0].name} ...`)
        mdns.respond({
          answers: [
            {
              name: query.questions[0].name,
              type: 'SRV',
              data: {
                port: this.apiPort,
                target: this.getIpAddress(),
              },
            },
          ],
        })
      }
    })
  }

  apiMarkStarred(ctx) {
    const { planetid, articleid, starred } = ctx.request.body
    const planet = rt.following.filter((p) => p.id === planetid)[0]
    if (planet) {
      const article = planet.articles.filter((a) => a.id === articleid)[0]
      if (article) {
        article.starred = starred
        article.save()
        rt.following = [...rt.following]
        evt.emit(evt.evRuntimeMiddleSidebarContentChange)
        ctx.body = { error: '' }
      } else {
        ctx.body = { error: 'article not found' }
      }
    } else {
      ctx.body = { error: 'planet not found' }
    }
  }

  apiMarkReaded(ctx) {
    const { planetid, articleid } = ctx.request.body
    const planet = rt.following.filter((p) => p.id === planetid)[0]
    if (planet) {
      const article = planet.articles.filter((a) => a.id === articleid)[0]
      if (article) {
        article.read = true
        article.save()
        rt.following = [...rt.following]
        evt.emit(evt.evRuntimeMiddleSidebarContentChange)
        ctx.body = { error: '' }
      } else {
        ctx.body = { error: 'article not found' }
      }
    } else {
      ctx.body = { error: 'planet not found' }
    }
  }

  async apiFairRequest(ctx) {
    const { planetid, articleid, duration, value, passwd } = ctx.request.body
    const planet = rt.planets.filter((p) => p.id === planetid)[0]
    if (!planet) {
      ctx.body = { error: `invalid planetid ${planetid}` }
      return
    }
    const article = planet.articles.filter((a) => a.id === articleid)[0]
    if (!article) {
      ctx.body = { error: `invalid articleid ${id}` }
      return
    }
    const error = await require('../controller/webviewTopbar').fairAction(
      article.planet.ipns,
      article.id,
      duration,
      value,
      passwd
    )
    ctx.body = { error: error || '' }
  }

  async apiFairPrepare(ctx) {
    const { planetid, articleid } = ctx.request.body
    const planet = rt.planets.filter((p) => p.id === planetid)[0]
    if (!planet) {
      ctx.body = { error: `invalid planetid ${planetid}` }
      return
    }
    const article = planet.articles.filter((a) => a.id === articleid)[0]
    if (!article) {
      ctx.body = { error: `invalid articleid ${id}` }
      return
    }
    ctx.body = await require('../controller/webviewTopbar').fairPrepare(article)
  }

  apiArticleGet(ctx) {
    const { planetid, articleid } = ctx.request.body
    const planet = rt.planets.filter((p) => p.id === planetid)[0]
    if (!planet) {
      ctx.body = { error: `invalid planetid ${planetid}` }
      return
    }
    const article = planet.articles.filter((a) => a.id === articleid)[0]
    if (!article) {
      ctx.body = { error: `invalid articleid ${id}` }
      return
    }

    ctx.body = {
      ...article.json(),
      attachments: article.attachments.map((a) => a.name),
      summary: FollowingArticle.extractSummary(article),
      url: `http://${this.ipAddr}:${this.apiPort}/${planetid}/${articleid}/`,
    }
  }

  apiListSite(ctx) {
    const ipfsGateway = `http://${this.getIpAddress()}:${ipfs.gatewayPort}`
    ctx.body = {
      ipfspeers: rt.ipfsPeers,
      ipfsGateway,
      fair: rt.fair.map((a) => ({
        ...a.json(),
        url: `${ipfsGateway}/ipns/${a.planet.ipns}/${a.id}/`,
      })),
      planets: rt.planets.map((p) => ({
        ...p.json(),
        avatar: p.avatar,
        articles: p.articles.map((a) => {
          const obj = a.json()
          obj.summary = FollowingArticle.extractSummary(a)
          obj.editable = true
          delete obj.content
          obj.url = `http://${this.ipAddr}:${this.apiPort}/${p.id}/${a.id}/`
          obj.attachments = obj.attachments.map((a) => a.name)
          return obj
        }),
      })),
      following: rt.following.map((p) => ({
        ...p.json(),
        avatar: p.avatar,
        articles: p.articles.map((a) => {
          const obj = a.json()
          obj.summary = FollowingArticle.extractSummary(a)
          delete obj.content
          obj.url = `${ipfsGateway}/ipfs/${p.cid}/${a.id}/`
          obj.pinState = a.pinState
          return obj
        }),
      })),
      address: wallet.wallet.address,
    }
  }

  async apiPlanetCreate(ctx) {
    await require('../controller/planet').createPlanet(ctx.request.body)
    ctx.body = { error: '' }
  }

  async apiPlanetFollow(ctx) {
    await require('../controller/planet').followPlanet(ctx.request.body)
    ctx.body = { error: '' }
  }

  async upload(ctx) {
    // log.info(ctx.request.files)
    const { file } = ctx.request.files
    if (file && rt.draft && rt.draft.attachments) {
      if (
        rt.draft.attachments.filter((a) => a.name === file.originalFilename)[0] ||
        rt.draft.videoFilename == file.originalFilename ||
        rt.draft.audioFilename == file.originalFilename
      ) {
        require('fs').renameSync(file.filepath, require('path').join(rt.draft.attachmentsPath, file.originalFilename))
        ctx.body = { error: '' }
        return
      }
    }
    ctx.body = { error: 'not allowed' }
  }

  async apiPublishDraft(ctx) {
    const { planetid, id, title, content, attachments, audioFilename, videoFilename, created } = ctx.request.body
    const planet = rt.planets.filter((p) => p.id === planetid)[0]
    if (!planet) {
      ctx.body = { error: `invalid planet id ${planetid}` }
      return
    }
    const draft = new Draft(planet, null, {
      id,
      title,
      content,
      created,
      audioFilename,
      videoFilename,
      attachments: attachments.map((a) => ({ name: a })),
    })
    rt.draft = draft
    const files = (attachments || []).filter(
      (a) => !require('fs').existsSync(require('path').join(draft.attachmentsPath, a))
    )
    var audioFileTarget = null
    if (audioFilename) {
      var article = planet.articles.filter((a) => a.id === id)[0]
      if (require('fs').existsSync(require('path').join(draft.attachmentsPath, audioFilename))) {
        audioFileTarget = require('path').join(draft.attachmentsPath, audioFilename)
      } else if (article && require('fs').existsSync(require('path').join(article.publicBase, audioFilename))) {
        audioFileTarget = require('path').join(article.publicBase, audioFilename)
      }
    }
    if (audioFilename && !audioFileTarget) {
      log.debug('put audio file', { audioFilename, audioFileTarget })
      files.push(audioFilename)
    }

    var videoFileTarget = null
    if (videoFilename) {
      var article = planet.articles.filter((a) => a.id === id)[0]
      if (require('fs').existsSync(require('path').join(draft.attachmentsPath, videoFilename))) {
        videoFileTarget = require('path').join(draft.attachmentsPath, videoFilename)
      } else if (article && require('fs').existsSync(require('path').join(article.publicBase, videoFilename))) {
        videoFileTarget = require('path').join(article.publicBase, videoFilename)
      }
    }
    if (videoFilename && !videoFileTarget) {
      files.push(videoFilename)
    } else {
      log.debug('got videofile at', videoFileTarget)
    }

    log.debug('files debug', { attachments, files, length: files.length })
    if (files.length > 0) {
      ctx.body = { files }
    } else {
      if (audioFilename) {
        draft.audioFilename = audioFileTarget
      }
      if (videoFilename) {
        draft.videoFilename = videoFileTarget
      }
      await draft.publish()
      ctx.body = { error: '' }
    }
  }

  async apiDeletePlanet(ctx) {
    const { id } = ctx.request.body
    const planet = rt.planets.filter((p) => p.id === id)[0]
    rt.planets = rt.planets.filter((p) => p.id !== id)
    if (planet) {
      await planet.delete()
    }
    ctx.body = { error: '' }
  }

  async apiUnfollowPlanet(ctx) {
    const { id } = ctx.request.body
    const planet = rt.following.filter((p) => p.id === id)[0]
    rt.following = rt.following.filter((p) => p.id !== id)
    if (planet) {
      await planet.delete()
    }
    ctx.body = { error: '' }
  }

  async apiFairMarkReaded(ctx) {
    await Promise.all(rt.fair.map((a) => a.confirmRead()))
    rt.fair = [...rt.fair]
    ctx.body = { error: '' }
  }

  async apiUpdateAvatar(ctx) {
    const { id, avatar } = ctx.request.body
    const planet = rt.planets.filter((p) => p.id === id)[0]
    if (!planet) {
      ctx.body = { error: `invalid id: ${id}` }
      return
    }
    const image = await Jimp.read(Buffer.from(avatar, 'base64'))
    await image.resize(256, 256).quality(80).writeAsync(planet.avatarPath)
    planet.avatar = 'avatar.png'
    await planet.save()
    evt.emit(evt.evRuntimePlanetsChange)
    planet.publish()
    ctx.body = { error: '' }
  }

  async apiDlnaList(ctx) {
    ctx.body = {
      devices: require('./dlna')
        .nodeCast.getList()
        .map((d) => ({
          name: d.name,
          host: d.host,
          type: d.type,
        })),
    }
  }

  async apiDlnaPlay(ctx) {
    const { device, url } = ctx.request.body
    const d = require('./dlna')
      .nodeCast.getList()
      .filter((d) => (d.name = device))[0]
    if (d) {
      d.play(url)
      ctx.body = { error: '' }
    } else {
      ctx.body = { error: 'no device' }
    }
  }

  async apiDeleteArticle(ctx) {
    const { id, planetid } = ctx.request.body
    const planet = rt.planets.filter((p) => p.id === planetid)[0]
    if (!planet) {
      ctx.body = { error: `invalid planetid ${planetid}` }
      return
    }
    const article = planet.articles.filter((a) => a.id === id)[0]
    if (!article) {
      ctx.body = { error: `invalid articleid ${id}` }
      return
    }
    await require('../controller/webviewTopbar').doDeleteArticle(planetid, id)
    ctx.body = { error: '' }
  }

  async apiAltStore(ctx) {
    const ipaAttachment = (a) => {
      for (let at of a.attachments || []) {
        if (at.toLowerCase().endsWith('.ipa')) return at
      }
    }
    const ipfsGateway = `http://${this.getIpAddress()}:${ipfs.gatewayPort}`
    ctx.body = {
      name: 'Scbrf Local AltStore',
      identifier: 'eth.yygqg',
      apps: rt.following
        .reduce((r, p) => {
          if (!require('fs').existsSync(p.rawPath)) return r
          const rawArticles = JSON.parse(require('fs').readFileSync(p.rawPath).toString()).articles || []
          return [...r, ...rawArticles.filter((a) => ipaAttachment(a)).map((a) => ({ ...a, planet: p }))]
        }, [])
        .map((a) => ({
          name: a.bundlename,
          bundleIdentifier: a.bundleid,
          developerName: a.author,
          version: a.version,
          versionDate: new Date(require('../utils/datetime').timeFromReferenceDate(a.created)),
          versionDescription: a.content,
          downloadURL: `${ipfsGateway}/ipfs/${a.planet.cid}/${a.id}/${encodeURIComponent(ipaAttachment(a))}`,
          localizedDescription: a.desc,
          iconURL: a.icon,
          tintColor: '018084',
          size: a.ipaSize,
          screenshotURLs: [],
        })),
      news: [],
    }
  }

  startListen() {
    const app = new Koa()
    const bodyParser = require('koa-body')
    const range = require('koa-range')
    const Router = require('koa-router')
    const serve = require('koa-static')
    app.use(range)
    app.use(
      serve(Planet.PublicRoot, {
        maxage: 600000,
      })
    )
    const router = new Router()
    app.use(
      bodyParser({
        multipart: true,
      })
    )
    app.use(logger)
    router.post('/ipc', async (ctx) => {
      const { method, params, requestid } = ctx.request.body
      if (method === 'personal_sign') {
        ctx.body = {
          requestid,
          data: await wallet.wallet.signMessage(params[0]),
        }
      }
    })
    router.post('/planet/create', this.apiPlanetCreate.bind(this))
    router.post('/planet/follow', this.apiPlanetFollow.bind(this))
    router.post('/article/markreaded', this.apiMarkReaded.bind(this))
    router.post('/article/markstarred', this.apiMarkStarred.bind(this))
    router.post('/article/delete', this.apiDeleteArticle.bind(this))
    router.post('/article/get', this.apiArticleGet.bind(this))
    router.post('/fair/prepare', this.apiFairPrepare.bind(this))
    router.post('/fair/request', this.apiFairRequest.bind(this))
    router.post('/draft/publish', this.apiPublishDraft.bind(this))
    router.post('/planet/delete', this.apiDeletePlanet.bind(this))
    router.post('/fair/markreaded', this.apiFairMarkReaded.bind(this))
    router.post('/planet/unfollow', this.apiUnfollowPlanet.bind(this))
    router.post('/planet/avatar', this.apiUpdateAvatar.bind(this))
    router.post('/site', this.apiListSite.bind(this))
    router.post('/dlna/list', this.apiDlnaList.bind(this))
    router.post('/dlna/play', this.apiDlnaPlay.bind(this))
    router.post('/upload', this.upload.bind(this))
    router.get('/altstore', this.apiAltStore.bind(this))

    app.use(router.routes()).use(router.allowedMethods())
    log.debug('api server started at port:', this.apiPort)
    app.listen(this.apiPort, '0.0.0.0')
  }
}

async function logger(ctx, next) {
  const start = new Date().getTime()
  try {
    await next()
    log.info(
      `${((new Date().getTime() - start) / 1000).toFixed(3)} ${ctx.request.url}, ${JSON.stringify(ctx.request.body)},${
        ctx.status
      }, ${JSON.stringify(ctx.body)}`
    )
  } catch (ex) {
    log.info(
      `${((new Date().getTime() - start) / 1000).toFixed(3)} ${ctx.request.url}, ${JSON.stringify(
        ctx.request.body
      )}, ${ex}`
    )
    throw ex
  }
}

module.exports = new ApiServer()
