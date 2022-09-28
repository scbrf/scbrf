const { BrowserWindow, app } = require('electron')
const log = require('../utils/log')('mainwindow')
const evt = require('../utils/events')
const planet = require('./planet')
const articles = require('./articles')
const webview = require('./webview')
const webviewTopbar = require('./webviewTopbar')
const audioPlayer = require('./audioplayer')

class MainWindowController {
  constructor() {
    evt.bindBusTable(this, [
      [evt.evCreateWindow, this.createWindow],
      [evt.evRebounds, this.rebounds],
      [evt.evTrayOpen, this.activeOrCreateWindow],
    ])
    evt.bindIpcMainTable(this, [
      [evt.ipcCloseWin, (e) => BrowserWindow.fromWebContents(e.sender).close()],
      [evt.ipcMinimalWin, (e) => BrowserWindow.fromWebContents(e.sender).minimize()],
      [evt.ipcTriggleRootPanel, this.triggerRootPabel],
      [evt.ipcAppQuit, () => app.quit()],
    ])
  }
  createWindow() {
    this.win = new BrowserWindow({
      width: 1600,
      height: 900,
      vibrancy: 'sidebar',
      visualEffectState: 'followWindow',
      titleBarStyle: 'hidden',
      icon: 'resources/icon.png',
      trafficLightPosition: {
        x: 18,
        y: 18,
      },
    })

    this.win.addBrowserView(planet.view)
    planet.init()

    this.win.addBrowserView(articles.view)
    articles.init()

    this.win.addBrowserView(webview.view)
    webview.init()

    this.win.addBrowserView(webviewTopbar.view)
    webviewTopbar.init()

    this.win.addBrowserView(audioPlayer.view)
    audioPlayer.init()

    this.win.once('show', () => {
      evt.emit(evt.evRebounds)
    })

    this.win.on('close', () => {
      this.win = null
    })
    this.rebounds()
  }
  triggerRootPabel() {
    let root
    if (planet.view.getBounds().width > 0) {
      // need remove planet view
      root = false
    } else {
      // need append planet view
      root = true
    }
    evt.emit(evt.evRebounds, { root })
  }
  rebounds(p) {
    log.info('need rebound', arguments)
    this.boundsProps = {
      ...(this.boundsProp || {
        root: true,
        player: false,
      }),
      ...p,
    }
    const { root, player } = this.boundsProps
    const [width, height] = this.win.getSize()
    log.info('reounds with props', { root, player, width, height })
    planet.view.setBounds({ x: 0, y: 0, width: root ? 300 : 0, height })
    planet.view.setBounds({ x: 0, y: 0, width: root ? 300 : 0, height })
    articles.view.setBounds({
      x: root ? 300 : 0,
      y: 0,
      width: 300,
      height,
    })
    articles.view.setBounds({
      x: root ? 300 : 0,
      y: 0,
      width: 300,
      height,
    })
    webviewTopbar.view.setBounds({
      x: root ? 600 : 300,
      y: 0,
      width: root ? width - 600 : width - 300,
      height: 48,
    })
    audioPlayer.view.setBounds({
      x: root ? 600 : 300,
      y: 49,
      width: root ? width - 600 : width - 300,
      height: player ? 48 : 0,
    })
    webview.view.setBounds({
      x: root ? 600 : 300,
      y: player ? 97 : 49,
      width: root ? width - 600 : width - 300,
      height: player ? height - 96 : height - 48,
    })
  }
  activeOrCreateWindow() {
    if (this.win) {
      if (this.win.isMinimized()) {
        this.win.restore()
      }
      this.win.focus()
    } else {
      this.createWindow()
    }
  }
}

module.exports = new MainWindowController()
