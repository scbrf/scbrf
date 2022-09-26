const { app } = require('electron')
const log = require('./src/utils/log')('main')

if (require('electron-squirrel-startup')) {
  return app.quit()
}
console.log('**************', process.env.NODE_ENV)
const lock = app.requestSingleInstanceLock()
if (!lock) {
  app.quit()
}

app.whenReady().then(() => {
  require('./src/controller/app').start()
})
