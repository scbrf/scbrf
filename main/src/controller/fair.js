const FETCH_DELAY = 5 * 60 * 1000 //每更新一次休息5分钟
const log = require('../utils/log')('fair')
const evt = require('../utils/events')
const rt = require('../models/runtime')
const { FairArticle } = require('../models/index')

class Fair {
  constructor() {
    evt.bindBusTable(this, [[evt.evAppInit, this.init]])
  }

  //集市初始化，定期执行fetch，得到一个排行榜，更新 rt.fair
  async init() {
    if (!require('fs').existsSync(FairArticle.FairArticlesPath)) {
      require('fs').mkdirSync(FairArticle.FairArticlesPath)
    }
    while (true) {
      try {
        await this.fetch()
      } catch (ex) {
        log.error('error on fetch', ex.message)
      }
      await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY))
    }
  }
  async fetch() {
    const [list, len] = await require('../utils/wallet').fairHot50()
    log.debug('got hot50', len.toNumber())
    const rawList = list.slice(0, len.toNumber()).map((a) => {
      const { ipns, uuid, value, duration, when } = a
      return {
        ipns,
        uuid,
        value: require('ethers').utils.formatEther(value),
        duration: duration.toNumber(),
        when: when.toNumber(),
      }
    })
    //先加载本地已经存在的
    const fair = await Promise.all(
      Array.from(new Set(rawList.map((a) => a.uuid))).map((uuid) => FairArticle.load(uuid))
    )
    rt.fair = fair.filter((a) => a)
    //通过ipfs网络刷新全部
    await Promise.all(
      Object.values(
        rawList.reduce((r, i) => {
          r[i.uuid] = i
          return r
        }, {})
      ).map((a) => FairArticle.fetch(a))
    )
  }
}

module.exports = new Fair()
