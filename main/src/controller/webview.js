const { BrowserView, ipcMain, BrowserWindow } = require('electron')
const bunyan = require('bunyan')
const evt = require('../utils/events')
const log = bunyan.createLogger({ name: 'webview' })

class Webview {
  constructor() {
    evt.bindBusTable(this, [[evt.evAppInit, this.createView]])
  }
  createView() {
    this.view = new BrowserView({
      webPreferences: {
        webSecurity: false,
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
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
    // this.view.webContents.openDevTools({mode: 'undocked'})
    // ipcMain.on('articleFocus', async (_, p) => {
    //   log.info('webview switch to url', p.url)
    //   await this.view.webContents.executeJavaScript(`(()=>{
    //                 document.body.style = "widht:100vw;height:100vh;display:flex;align-items:center;justify-content:center;";
    //                 document.body.innerHTML = "Loading...";
    //             })()`)
    //   await new Promise((resolve) => setTimeout(resolve, 100))
    //   this.view.webContents.loadURL(p.url, { userAgent: 'Planet/JS' })
    // })
    // bus.on('focusInfo', async (p) => {
    //   const article = p.articles.filter((a) => a.id === p.focus)[0]
    //   if (article) {
    //     log.info('webview switch to url', article.url)
    //     await this.view.webContents.executeJavaScript(`(()=>{
    //                     document.body.style = "widht:100vw;height:100vh;display:flex;align-items:center;justify-content:center;";
    //                     document.body.innerHTML = "Loading...";
    //                 })()`)
    //     await new Promise((resolve) => setTimeout(resolve, 100))
    //     this.view.webContents.loadURL(article.url, { userAgent: 'Planet/JS' })
    //   } else {
    //     this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/loading`, { userAgent: 'Planet/JS' })
    //   }
    // })
  }
  init() {
    this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/loading`)
    this.view.setAutoResize({ height: true, width: true })
  }
}

module.exports = new Webview()
