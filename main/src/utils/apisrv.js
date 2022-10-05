const portfinder = require('portfinder')
const Koa = require('koa')
const log = require('../utils/log')('api')
const rt = require('../models/runtime')
const wallet = require('./wallet')
const ipfs = require('./ipfs')
const FollowingArticle = require('../models/followingArticle')

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

  startListen() {
    const app = new Koa()
    const bodyParser = require('koa-bodyparser')
    const Router = require('koa-router')
    const router = new Router()
    app.use(bodyParser())
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
    router.post('/site', (ctx) => {
      const ipfsGateway = `http://${this.getIpAddress()}:${ipfs.gatewayPort}`
      ctx.body = {
        ipfspeers: rt.ipfsPeers,
        ipfsGateway,
        planets: rt.planets.map((p) => ({
          ...p.json(),
          articles: p.articles.map((a) => {
            const obj = a.json()
            obj.summary = FollowingArticle.extractSummary(a)
            delete obj.content
            obj.url = `${ipfsGateway}/ipns/${p.ipns}/${a.id}/`
            return obj
          }),
        })),
        following: rt.following.map((p) => ({
          ...p.json(),
          articles: p.articles.map((a) => {
            const obj = a.json()
            obj.summary = FollowingArticle.extractSummary(a)
            obj.created = require('./datetime').timeFromReferenceDate(obj.created)
            delete obj.content
            obj.url = `${ipfsGateway}/ipfs/${p.cid}/${a.id}/`
            return obj
          }),
        })),
        address: wallet.wallet.address,
      }
    })
    app.use(router.routes()).use(router.allowedMethods())
    log.debug('api server started at port:', this.apiPort)
    app.listen(this.apiPort, '0.0.0.0')
  }
}

async function logger(ctx, next) {
  const start = new Date().getTime()
  try {
    await next()
    log.debug(
      `${((new Date().getTime() - start) / 1000).toFixed(3)} ${ctx.request.url}, ${JSON.stringify(ctx.request.body)},${
        ctx.status
      }, ${JSON.stringify(ctx.body)}`
    )
  } catch (ex) {
    log.debug(
      `${((new Date().getTime() - start) / 1000).toFixed(3)} ${ctx.request.url}, ${JSON.stringify(
        ctx.request.body
      )}, ${ex}`
    )
    throw ex
  }
}

module.exports = new ApiServer()
