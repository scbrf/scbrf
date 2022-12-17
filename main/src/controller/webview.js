const { BrowserView } = require('electron')
const evt = require('../utils/events')
const log = require('../utils/log')('webview')

const rt = require('../models/runtime')

class Webview {
  constructor() {
    evt.bindBusTable(this, [
      [evt.evAppInit, this.createView],
      [evt.evRuntimeMiddleSidebarFocusChange, this.loadWeb],
      [evt.evRuntimeFansOnlyPreview, this.loadWeb],
    ])
    evt.bindIpcMainTable(this, [
      [evt.ipcShareOpen, this.shareOpen],
      [evt.ipcSwitchFansOnly, this.switchFansOnlyPreview],
    ])
  }
  createView() {
    this.view = new BrowserView({
      webPreferences: {
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
  shareOpen() {
    require('electron').shell.openExternal(this.targetUrl || this.view.webContents.getURL())
  }
  switchFansOnlyPreview() {
    rt.fansOnlyPreview = !rt.fansOnlyPreview
  }
  async loadWeb() {
    if (!this.view) return
    if (rt.middleSideBarFocusArticle) {
      //give it a loading hint
      this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/loading`)
      this.view.webContents.once('dom-ready', () => {
        // const url = `http://${require('../utils/apisrv').ipAddr}:${require('../utils/apisrv').apiPort}/${
        //   rt.middleSideBarFocusArticle.planet.id
        // }/${rt.middleSideBarFocusArticle.id}/index.html?seed=${new Date().getTime()}`
        this.targetUrl = rt.middleSideBarFocusArticle.url(rt.fansOnlyPreview)
        this.view.webContents.loadURL(this.targetUrl, { userAgent: 'Planet/JS' })
      })
    } else {
      const url = `${require('../utils/websrv').WebRoot}/empty`
      this.view.webContents.loadURL(url, { userAgent: 'Planet/JS' })
    }
  }
}

module.exports = new Webview()
