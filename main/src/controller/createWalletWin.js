const { BrowserWindow } = require('electron')
class CreateWalletWin {
  createWin() {
    return new BrowserWindow({
      width: 600,
      height: 400,
      titleBarStyle: 'hidden',
      icon: 'resources/icon.png',
      trafficLightPosition: {
        x: 18,
        y: 18,
      },
      frame: false,
      closable: false,
      maximizable: false,
      minimizable: false,
      resizable: false,
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
  }
  async show() {
    const win = this.createWin()
    win.loadURL(`${require('../utils/websrv').WebRoot}/wallet/create`)
    await new Promise((resolve) => {
      win.on('close', resolve)
      win.show()
      win.webContents.openDevTools()
    })
  }
}

module.exports = new CreateWalletWin()
