const { app } = require('electron')

if (require('electron-squirrel-startup')) {
  return app.quit()
}

const lock = app.requestSingleInstanceLock()
if (!lock) {
  app.quit()
}

app.whenReady().then(() => {
  const rootdir = process.env.SCARBOROUGH_ROOT
    ? require('path').resolve(process.env.SCARBOROUGH_ROOT)
    : app.getPath('userData')
  app.__root__ = rootdir
  require('./src/controller/app').start()
})
