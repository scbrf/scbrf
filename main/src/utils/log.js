const bunyan = require('bunyan')

module.exports = (name, opt = {}) => {
  const opts = {
    name,
    level: 'debug',
    streams: [
      {
        level: process.env.NODE_ENV === 'test' ? 'error' : 'debug',
        stream: process.stdout,
      },
      {
        level: 'error',
        stream: process.stderr,
      },
    ],
    ...opt,
  }
  if (process.env.NODE_ENV !== 'test') {
    const { app } = require('electron')
    const logBase = require('path').join(app.__root__ || '/tmp', 'logs')
    if (!require('fs').existsSync(logBase)) {
      require('fs').mkdirSync(logBase, { recursive: true })
    }
    opts.streams = [
      ...opts.streams,
      {
        level: 'info',
        path: require('path').join(logBase, `${name}.log`),
      },
      {
        level: 'error',
        path: require('path').join(logBase, `__error.log`),
      },
    ]
  }
  return bunyan.createLogger(opts)
}
