const { BrowserWindow } = require('electron')
class CreateWalletWin {
  createWin() {
    return new BrowserWindow({
      width: 400,
      height: 300,
      titleBarStyle: 'hidden',
      icon: 'resources/icon.png',
      trafficLightPosition: {
        x: 18,
        y: 18,
      },
      frame: true,
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
    // win.webContents.openDevTools()
    win.loadURL(`${require('../utils/websrv').WebRoot}/wallet/unlock`)
    await new Promise((resolve) => {
      win.on('close', resolve)
      win.show()
    })
  }
}

module.exports = new CreateWalletWin()
