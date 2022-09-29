const evt = require('../utils/events')
const rt = require('../models/runtime')
const log = require('../utils/log')('upmanager')

/**
 * 处理Planets和Following的定期更新
 */
class UpManager {
  PUBLISH_DELTA = 30 * 60 * 1000
  UPDATE_DELTA = 30 * 60 * 1000
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
        log.debug('no up rec, set next up to', planet.id, this.upSchedule[planet.id])
      }
      if (now > this.upSchedule[planet.id]) {
        this.upSchedule[planet.id] = now + Math.random() * this.PUBLISH_DELTA + this.PUBLISH_DELTA
        planet.publish()
      } else if (this.upSchedule[planet.id] < planet.lastPublished + 2 * this.PUBLISH_DELTA) {
        this.upSchedule[planet.id] = planet.lastPublished + this.PUBLISH_DELTA + Math.random() * this.PUBLISH_DELTA
        log.debug('maybe manual update, set next up to', planet.id, this.upSchedule[planet.id])
      }
    }
    for (let planet of rt.following) {
      if (!(planet.id in this.upSchedule)) {
        this.upSchedule[planet.id] = now + Math.random() * this.UPDATE_DELTA + this.UPDATE_DELTA
        log.debug('no up rec, set next up to', planet.id, this.upSchedule[planet.id])
      }
      if (now > this.upSchedule[planet.id]) {
        this.upSchedule[planet.id] = now + Math.random() * this.UPDATE_DELTA + this.UPDATE_DELTA
        planet.update()
      } else if (this.upSchedule[planet.id] < planet.lastRetrieved + 2 * this.UPDATE_DELTA) {
        this.upSchedule[planet.id] = planet.lastRetrieved + this.UPDATE_DELTA + Math.random() * this.UPDATE_DELTA
        log.debug('maybe manual update, set next up to', planet.id, this.upSchedule[planet.id])
      }
    }
  }
}

module.exports = new UpManager()
