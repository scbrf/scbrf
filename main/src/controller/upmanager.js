const evt = require('../utils/events')
const rt = require('../models/runtime')

/**
 * 处理Planets和Following的定期更新
 */
class UpManager {
  PUBLISH_DELTA = 5 * 60 * 1000
  UPDATE_DELTA = 15 * 60 * 1000
  constructor() {
    evt.bindBusTable(this, [[evt.evAppInit, this.start]])
    this.upSchedule = {}
  }
  start() {
    setInterval(() => {
      this.doCheck()
    }, 1000)
  }
  doCheck() {
    const now = new Date().getTime()
    for (let planet of rt.planets) {
      if (!(planet.id in this.upSchedule)) {
        this.upSchedule[planet.id] = now + Math.random() * this.PUBLISH_DELTA + this.PUBLISH_DELTA
      }
      if (now > this.upSchedule[planet.id]) {
        this.upSchedule[planet.id] = now + Math.random() * this.PUBLISH_DELTA + this.PUBLISH_DELTA
        planet.publish()
      }
    }
    for (let planet of rt.following) {
      if (!(planet.id in this.upSchedule)) {
        this.upSchedule[planet.id] = now + Math.random() * this.UPDATE_DELTA + this.UPDATE_DELTA
      }
      if (now > this.upSchedule[planet.id]) {
        this.upSchedule[planet.id] = now + Math.random() * this.UPDATE_DELTA + this.UPDATE_DELTA
        planet.update()
      }
    }
  }
}

module.exports = new UpManager()
