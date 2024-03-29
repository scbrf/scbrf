const { default: axios } = require('axios')
const log = require('../utils/log')('modelsFollowingPlanet')

const uuid = require('uuid').v4
const ipfs = require('../utils/ipfs')
const wallet = require('../utils/wallet')
const FollowingArticle = require('./followingArticle')
const evt = require('../utils/events')
const rt = require('./runtime')

class FollowingPlanet {
  static followingPlanetsPath
  constructor(params) {
    this.id = (params.id || uuid()).toUpperCase()
    this.planetType = params.planetType || '.ens'
    this.name = params.name
    this.about = params.about || ''
    this.link = params.link || ''
    this.cid = params.cid || ''
    this.ipns = params.ipns || ''
    this.created = params.created
    this.updated = params.updated
    this.githubUsername = params.githubUsername || null
    this.twitterUsername = params.twitterUsername || null
    this.lastRetrieved = params.lastRetrieved || new Date().getTime()
    this.articles = []

    this.basePath = require('path').join(FollowingPlanet.followingPlanetsPath, this.id)
    this.articlesPath = require('path').join(this.basePath, 'Articles')
    this.infoPath = require('path').join(this.basePath, 'planet.json')
    this.rawPath = require('path').join(this.basePath, 'raw.json')
    this.avatarPath = require('path').join(this.basePath, 'avatar.png')
  }
  save() {
    require('fs').writeFileSync(this.infoPath, JSON.stringify(this.json()))
  }

  delete() {
    require('fs').rmSync(this.basePath, {
      recursive: true,
      force: true,
    })
  }

  json() {
    return {
      id: this.id,
      planetType: this.planetType,
      name: this.name,
      about: this.about,
      link: this.link,
      ipns: this.ipns,
      cid: this.cid,
      created: this.created,
      updated: this.updated,
      lastRetrieved: this.lastRetrieved,
      githubUsername: this.githubUsername,
      twitterUsername: this.twitterUsername,
    }
  }

  static async load(id) {
    const planetPath = require('path').join(FollowingPlanet.followingPlanetsPath, id, 'planet.json')
    if (require('fs').existsSync(planetPath)) {
      const json = JSON.parse(require('fs').readFileSync(planetPath).toString())
      log.info(`load planet from id ${id} got`, json)
      const planet = new FollowingPlanet(json)
      if (require('fs').existsSync(planet.avatarPath)) {
        planet.avatar = require('path').basename(planet.avatarPath)
      }
      return planet
    } else {
      log.info(`${id} has an empty planet!`)
    }
  }

  async update() {
    if (this.updating) {
      return false
    }
    this.updating = true
    rt.following = [...rt.following]

    try {
      // 更新 Following 的内容
      const newPlanet = await FollowingPlanet.follow(this.link)
      if (!newPlanet) {
        log.info('update following get nothing', { link: this.link })
      } else {
        for (let i in rt.following) {
          if (rt.following[i].id === this.id) {
            ;(newPlanet.articles || []).forEach((a) => {
              const oldarticle = rt.following[i].articles.filter((b) => a.id === b.id)[0]
              if (oldarticle) {
                a.read = oldarticle.read
                a.starred = oldarticle.starred
              }
            })
            const newArticles = newPlanet.articles.map((a) => a.id)
            rt.following[i].articles.forEach((a) => {
              if (newArticles.indexOf(a.id) < 0) {
                a.delete()
              }
            })
            rt.following[i] = newPlanet
            break
          }
        }
        log.info('update site succ', { name: this.name })
      }
    } catch (ex) {
      log.error('error when update', ex.message)
    }

    this.updating = false
    rt.following = [...rt.following]
  }

  /**
   * 从本地存储中加载已经保存的关注内容
   * 静态方法，将改变Runtime的值
   */
  static async loadFollowing() {
    const following = []
    const planets = await new Promise((resolve) => {
      require('fs').readdir(FollowingPlanet.followingPlanetsPath, (err, files) => {
        resolve(files)
      })
    })
    log.info(`read planet dir ${FollowingPlanet.followingPlanetsPath} get`, planets)
    for (let id of planets || []) {
      const planet = await FollowingPlanet.load(id)
      if (!planet) {
        log.info('read planet fail', { id })
        continue
      }

      const articles = await new Promise((resolve) => {
        require('fs').readdir(planet.articlesPath, (err, files) => {
          resolve(files)
        })
      })
      log.debug('load articles return', { articles, id })
      for (let name of articles) {
        const article = FollowingArticle.load(name, planet)
        if (article) {
          planet.articles.push(article)
        } else {
          log.info('load article fail', { name })
        }
      }
      planet.articles.sort((a, b) => b.created - a.created)
      following.push(planet)
    }
    log.info('load following planet done!')
    require('./runtime').following = following
  }

  static async follow(target, cb = () => {}) {
    let link = target.trim()
    let ipns = await FollowingPlanet.getIPNS(link)
    let cid
    if (ipns && ipns.startsWith('ipns://')) {
      ipns = ipns.substring('ipns://'.length)
    } else if (link.startsWith('12D3')) {
      ipns = link
    }
    if (ipns) {
      cid = await FollowingPlanet.getCID(ipns)
    } else if (link.startsWith('ipfs://')) {
      cid = link.substring('ipfs://'.length)
    }
    const planet = await FollowingPlanet.followCID(cid, cb)
    if (planet) {
      planet.link = link
      planet.planetType = link.endsWith('.eth') ? '.ens' : link.endsWith('.bit') ? '.bit' : '.ipns'
      if (ipns) {
        planet.ipns = ipns
      }
      await planet.save()
      await Promise.all(planet.articles.map((a) => a.save()))
      return planet
    }
  }

  static async getCID(ipns) {
    log.debug(`resolve ipns to cid`, ipns)
    return ipfs.resolveIPNSorDNSLink(ipns)
  }

  static async followENS(link, cb) {
    cb(`resolve ens to ipns ...`)
    const ipns = await wallet.resolveENS(link)
    if (ipns) {
      cb(`done, following ipns ...`)
      const planet = await FollowingPlanet.followIPNSorDNSLink(ipns, cb)
      planet.planetType = '.ens'
      planet.link = link
      if (!planet.avatar) {
        try {
          let avatarUrl = await wallet.resolveAvatar(link)
          if (avatarUrl) {
            await planet.downloadAvatar(avatarUrl)
          }
        } catch (ex) {
          log.error('try resolve avatar got exception', ex)
        }
      }
      await planet.save()
      await Promise.all(planet.articles.map((a) => a.save()))
      log.info('follow planet done!')
      return planet
    } else {
      cb(`resolve ens fail!`)
    }
  }

  static async resolveBit(link) {
    const body = {
      account: link,
    }
    const rsp = await axios.post('https://indexer-v1.did.id/v1/account/records', body)
    const data = rsp.data
    if (data.errno === 0) {
      let key
      let res = data.data.records.filter((r) => r.key === 'dweb.ipns')[0]
      if (res) {
        key = `ipns://${res.value}`
      }
      res = data.data.records.filter((r) => r.key === 'dweb.ipfs')[0]
      if (res) {
        key = `ipfs://${rec.value}`
      }
      if (key) {
        return key
      }
    } else {
      log.error('resolve .bit domain fail', data.errmsg)
    }
  }

  static async getIPNS(link) {
    if (link.endsWith('.eth')) {
      return await wallet.resolveENS(link)
    } else if (link.endsWith('.bit')) {
      return await FollowingPlanet.resolveBit(link)
    }
  }

  async downloadAvatar(url) {
    try {
      await require('../utils/download')(url, this.avatarPath)
      this.avatar = require('path').basename(this.avatarPath)
    } catch (ex) {
      log.error(`download avatar from ${url} fail`, ex.toString())
    }
  }

  static async followCID(cid, cb) {
    log.info('resolve cnt', cid)
    cb(`got ${cid}, try pin, it may takes a few minutes ...`)
    await ipfs.pin(cid)
    cb(`fetch planet content ...`)
    const planetUrl = `${ipfs.gateway}/ipfs/${cid}/planet.json`
    log.info('trying to fetch planet with url', planetUrl)
    const rsp = await require('axios').get(planetUrl)
    const publicPlanet = rsp.data
    cb(`done fetch, try to save prepare planet local directories ...`)
    // now publicPlanet contains the planet.json
    const planet = new FollowingPlanet({
      ...publicPlanet,
      cid,
    })

    require('fs').mkdirSync(planet.basePath, { recursive: true })
    require('fs').mkdirSync(planet.articlesPath, { recursive: true })
    require('fs').writeFileSync(planet.rawPath, JSON.stringify(publicPlanet))
    planet.articles = (publicPlanet.articles || []).map((a) =>
      FollowingArticle.create(
        {
          ...a,
          created: require('../utils/datetime').timeFromReferenceDate(a.created),
          updated: a.updated ? require('../utils/datetime').timeFromReferenceDate(a.updated) : new Date().getTime(),
        },
        planet
      )
    )
    planet.articles.sort((a, b) => b.created - a.created)
    const rtPlanet = rt.following.filter((p) => p.id === planet.id)[0]
    if (rtPlanet) {
      const sameCID = rtPlanet.cid === cid
      if (!sameCID) {
        log.info(`planet ${rtPlanet.name} content change from ${rtPlanet.cid} to ${cid}`)
      }
      planet.articles.forEach((a) => {
        const rtArticle = rtPlanet.articles.filter((aa) => aa.id === a.id)[0]
        if (rtArticle) {
          //以下状态需要继承自老状态
          a.read = rtArticle.read
          a.starred = rtArticle.starred
          if (sameCID) {
            a.pinState = rtArticle.pinState
          }
        }
      })
    }
    cb(`try to update planet avatar ...`)
    try {
      await planet.downloadAvatar(`${ipfs.gateway}/ipfs/${cid}/avatar.png`)
      cb(`done!`)
    } catch (ex) {
      cb(`avatar may not ready!`)
    }
    return planet
  }
}

module.exports = FollowingPlanet
