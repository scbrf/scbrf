const FETCH_DELAY = 5 * 60 * 1000 //每更新一次休息5分钟
const log = require('../utils/log')('fair')
const evt = require('../utils/events')

class Fair {
  constructor() {
    evt.bindBusTable(this, [[evt.evAppInit, this.init]])
  }

  //集市初始化，定期执行fetch，得到一个排行榜，更新 rt.fair
  async init() {
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
  }
}

module.exports = new Fair()
