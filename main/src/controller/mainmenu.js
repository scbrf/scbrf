class MainMenu {
  init() {
    const defaultMenu = require('electron-default-menu')
    const { Menu, app, shell } = require('electron')
    const menu = defaultMenu(app, shell)
    menu.splice(4, 0, {
      label: 'Wallet',
      submenu: [
        {
          label: 'Detail',
          click: this.openWalletWindow.bind(this),
        },
      ],
    })

    // Set top-level application menu, using modified template
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
  }

  async openWalletWindow(_, parent) {
    const { BrowserWindow } = require('electron')
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      parent,
      titleBarStyle: 'hidden',
      icon: 'resources/icon.png',
      trafficLightPosition: {
        x: 18,
        y: 18,
      },
      frame: false,
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    win.loadURL(`${require('../utils/websrv').WebRoot}/wallet/detail`)
    win.webContents.on('did-finish-load', async () => {
      win.webContents.send('wallet-detail', {
        network: (await require('../utils/wallet').network()).name,
        address: require('../utils/wallet').wallet.address,
        balance: await require('../utils/wallet').balance(),
      })
    })
    win.show()
  }
}

module.exports = new MainMenu()
