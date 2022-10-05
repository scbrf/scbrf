const { BrowserView } = require('electron')
const evt = require('../utils/events')
const log = require('../utils/log')('webview')

const rt = require('../models/runtime')

class Webview {
  constructor() {
    evt.bindBusTable(this, [
      [evt.evAppInit, this.createView],
      [evt.evRuntimeMiddleSidebarFocusChange, this.loadWeb],
    ])
  }
  createView() {
    this.view = new BrowserView({
      webPreferences: {
        webSecurity: false,
        preload: require('path').join(__dirname, '..', '..', 'preload_ethereum.js'),
      },
    })
    this.view.webContents.on('will-navigate', (e, url) => {
      if (!url.startsWith('http://')) {
        e.preventDefault()
        require('electron').shell.openExternal(url)
      }
      log.info('need open url', url)
      // return { action: 'deny' };
    })
    // this.view.webContents.openDevTools({ mode: 'undocked' })
  }
  init() {
    this.view.setAutoResize({ height: true, width: true })
    this.loadWeb()
  }
  async loadWeb() {
    if (!this.view) return
    if (rt.middleSideBarFocusArticle) {
      //give it a loading hint
      this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/loading`)
      this.view.webContents.once('dom-ready', () => {
        this.view.webContents.loadURL(rt.middleSideBarFocusArticle.url, { userAgent: 'Planet/JS' })
      })
    } else {
      this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/empty`, { userAgent: 'Planet/JS' })
    }
  }
}

module.exports = new Webview()
