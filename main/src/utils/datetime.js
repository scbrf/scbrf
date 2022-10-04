const ReferenceDate = new Date('2001-01-01').getTime()
class DateTime {
  timeIntervalSinceReferenceDate(v) {
    return (new Date(v).getTime() - ReferenceDate) / 1000.0
  }
  timeFromReferenceDate(v) {
    return Math.round(v * 1000 + ReferenceDate)
  }
}

module.exports = new DateTime()
