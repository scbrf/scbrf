//可以针对站点和文章设置pin模式，分为：pin，unpin，和auto三种模式，其中article的优先级高于站点的设置
//设置界面和pin以及unpin是对基本的auto模式的扩展，将在以后版本中实现，目前所有的站点和文章都是auto模式
//auto模式的含义是，根据created时间戳进行pin设置，如果created在三个星期之内，将会自动pin内容，超过三个星期，将会自动执行pin rm
const log = require('../utils/log')('pinmanaer')
const rt = require('../models/runtime')
const evt = require('../utils/events')
class PinManager {
  constructor() {
    evt.bindBusTable(this, [[evt.evIpfsDaemonReady, this.init]])
    this.inited = false
  }
  async init() {
    log.info('pin manager started ...')
    if (this.inited) {
      log.info('pin manager already inited ,return')
      return
    }
    this.inited = true
    while (true) {
      try {
        await this.checkPin()
      } catch (ex) {
        log.error('error when check pin', ex)
      }
      await new Promise((resolve) => setTimeout(resolve, 10000)) //每10秒钟检查一次
    }
  }

  //四种pinState: '':太老的文章 'wait':因为失败重试或者别的原因还没有在pin 'inprogress': 正在pin 'ready':pin成功了
  async pinArticle(article) {
    log.info(`pin new article ${article.title}`)
    article.pinState = 'inprogress'
    const cid = await require('../utils/ipfs').pin(`/ipfs/${article.planet.cid}/${article.id}/`, true)
    if (cid) {
      article.cidPin = cid
      article.pinState = 'ready'
      log.info(`after pin, article ${article.title} ${article.planet.cid}/${article.id} got cid ${cid}`)
    } else {
      article.pinState = 'wait'
      log.error(`new article ${article.title} pin error, wait another round!`)
    }
  }

  async checkPin() {
    log.debug('another round of check pin ...')
    //所有三周以内的文章
    const allNewArticles = rt.following.reduce((r, p) => {
      r = [...r, ...p.articles.filter((a) => new Date().getTime() - a.created < 21 * 24 * 3600 * 1000)]
      return r
    }, [])
    //所有三周以内没有被pin过的文章
    const allTargets = allNewArticles.filter((a) => !a.pinState || a.pinState == 'wait')
    //pin这些文章
    await Promise.all(allTargets.map(async (a) => await this.pinArticle(a)))
    //当前ipfs栈内所有的pin
    const allPins = [...(await require('../utils/ipfs').listPin()), ...rt.planets.map((p) => p.cid)]
    //新文章的cid和自建站点的cid应该保留pin
    const validpins = allNewArticles.map((a) => a.cidPin)
    //其它的pin全部删除
    const invalidPins = allPins.filter((p) => validpins.indexOf(p) < 0)
    await Promise.all(invalidPins.map((p) => require('../utils/ipfs').rmPin(p)))
  }
}

module.exports = new PinManager()
