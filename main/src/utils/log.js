const bunyan = require('bunyan')

module.exports = (name, opt = {}) => {
  return bunyan.createLogger({ name, level: process.env.NODE_ENV === 'dev' ? 'debug' : 'info', ...opt })
}
