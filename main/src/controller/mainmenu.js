const log = require('../utils/log')('mainmenu')
const rt = require('../models/runtime')

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

  async listWalletEvents() {
    return require('../utils/wallet').listOnlyfansSubscribeEvents()
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
      const info = {
        network: (await require('../utils/wallet').network()).name,
        address: require('../utils/wallet').wallet.address,
        balance: await require('../utils/wallet').balance(),
        events: await this.listWalletEvents(),
      }
      log.debug('got wallet info', info)
      await Promise.all(
        info.events.map(async (e) => {
          for (let planet of [...rt.following, ...rt.planets]) {
            const ipnsb58 = planet.ipns
            const { base58_to_binary } = require('base58-js')
            const pubkey = base58_to_binary(ipnsb58).slice(6)
            const ipns = '0x' + Buffer.from(pubkey).toString('hex')
            if (e.ipns == ipns) {
              e.planet = planet
              break
            }
          }
        })
      )
      win.webContents.send('wallet-detail', {
        ...info,
        events: info.events.map((e) => ({
          ...e,
          planet: e.planet ? e.planet.name : '',
        })),
      })
    })
    win.show()
  }
}

module.exports = new MainMenu()
