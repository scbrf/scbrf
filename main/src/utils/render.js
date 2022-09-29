const nunjucks = require('nunjucks')
const moment = require('moment')

class Render {
  getEnv(planet) {
    const templatePath = require('path').join(
      planet.constructor.templateBase,
      planet.template.toLowerCase(),
      'templates'
    )
    console.log('**************************** template path', templatePath)
    var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(templatePath), { autoescape: false })
    env.addFilter('escapejs', function (str) {
      return str
    })
    env.addFilter('formatDate', function (str) {
      return moment(parseFloat(str)).format('MMM D,YYYY [at] h:mm:ss A')
    })
    env.addFilter('ymd', function (str) {
      return moment(parseFloat(str)).format('YYYY-MM-DD')
    })
    return env
  }
}

module.exports = new Render()
