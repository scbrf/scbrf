const { app } = require('electron')
const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'main' })

if (require('electron-squirrel-startup')) {
  return app.quit()
}

const lock = app.requestSingleInstanceLock()
if (!lock) {
  app.quit()
}

app.whenReady().then(() => {
  require('./src/controller/app').start()
})
