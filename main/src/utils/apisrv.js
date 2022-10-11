const portfinder = require('portfinder')
const Koa = require('koa')
const log = require('../utils/log')('api')
const rt = require('../models/runtime')
const wallet = require('./wallet')
const ipfs = require('./ipfs')
const evt = require('../utils/events')
const { Draft, Planet, FollowingArticle } = require('../models')

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

  apiListSite(ctx) {
    const ipfsGateway = `http://${this.getIpAddress()}:${ipfs.gatewayPort}`
    ctx.body = {
      ipfspeers: rt.ipfsPeers,
      ipfsGateway,
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
    const { planetid, id, title, content, attachments, audioFilename, videoFilename } = ctx.request.body
    const planet = rt.planets.filter((p) => p.id === planetid)[0]
    if (!planet) {
      ctx.body = { error: `invalid planet id ${planetid}` }
      return
    }
    const draft = new Draft(planet, null, {
      id,
      title,
      content,
      audioFilename,
      videoFilename,
      attachments: attachments.map((a) => ({ name: a })),
    })
    rt.draft = draft
    const files = (attachments || []).filter(
      (a) => !require('fs').existsSync(require('path').join(draft.attachmentsPath, a))
    )
    if (audioFilename && !require('fs').existsSync(require('path').join(draft.attachmentsPath, audioFilename))) {
      files.push(audioFilename)
    }
    if (videoFilename && !require('fs').existsSync(require('path').join(draft.attachmentsPath, videoFilename))) {
      files.push(videoFilename)
    }
    log.debug('files debug', { attachments, files, length: files.length })
    if (files.length > 0) {
      ctx.body = { files }
    } else {
      if (audioFilename) {
        draft.audioFilename = require('path').join(draft.attachmentsPath, audioFilename)
      }
      if (videoFilename) {
        draft.videoFilename = require('path').join(draft.attachmentsPath, videoFilename)
      }
      await draft.publish()
      ctx.body = { error: '' }
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

  startListen() {
    const app = new Koa()
    const bodyParser = require('koa-body')
    const Router = require('koa-router')
    const serve = require('koa-static')
    app.use(serve(Planet.PublicRoot))
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
    router.post('/article/delete', this.apiDeleteArticle.bind(this))
    router.post('/draft/publish', this.apiPublishDraft.bind(this))
    router.post('/site', this.apiListSite.bind(this))
    router.post('/upload', this.upload.bind(this))

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