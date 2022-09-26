const { BrowserView, ipcMain, BrowserWindow, Menu, diaog, dialog } = require('electron')
const evt = require('../utils/events')
const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'topbar' })
const editorTopbar = require('./editor/editorTopbar')
const editorMain = require('./editor/editorMain')
const editorWebview = require('./editor/editorWebview')
const rt = require('../models/runtime')

class WebviewTopbar {
  constructor() {
    evt.bindBusTable(this, [
      [evt.evAppInit, this.createView],
      [evt.evRuntimeMiddleSidebarFocusChange, this.updateUI],
      [evt.evRuntimeSidebarFocusChange, this.updateUI],
    ])

    evt.bindIpcMainTable(this, [
      [evt.ipcNewArticle, this.newArticle],
      [evt.ipcPlanetInfo, this.planetInfo],
      [evt.ipcMyArticleCtxMenu, this.showMyArticleCtxMenu],
    ])
  }
  createView() {
    this.view = new BrowserView({
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })

    editorTopbar.createView()
    editorMain.createView()
    editorWebview.createView()

    // // this.view.webContents.openDevTools({mode: 'undocked'})

    this.articleCtxMenu = Menu.buildFromTemplate([
      {
        label: 'Edit Article',
        click: this.editArticle.bind(this),
      },
      {
        label: 'Delete Article',
        click: this.deleteArticle.bind(this),
      },
    ])
  }

  showMyArticleCtxMenu(event, a) {
    const win = BrowserWindow.fromWebContents(event.sender)
    this.ctxArticle = a
    this.articleCtxMenu.popup(win)
  }

  planetInfo(event) {
    if (!rt.middleSideBarFocusArticle) return
    let planet = rt.middleSideBarFocusArticle.planet
    const win = BrowserWindow.fromWebContents(event.sender)
    dialog.showMessageBoxSync(win, {
      message: planet.about,
      detail: `update at ${require('moment')(planet.lastRetrieved || planet.lastPublished).format(
        'MMM D, YYYY HH:mm:ss'
      )}`,
      type: 'info',
      buttons: ['OK'],
      title: planet.name,
      icon: planet.avatar ? planet.avatarPath : null,
    })
  }

  newArticle() {
    if (!rt.sidebarFocus) return
    const planet = rt.sidebarFocus
    let draft = planet.drafts.length > 0 ? planet.drafts[0] : new Draft(planet)
    log.info('when create new draft, created date is:', draft.created)
    this.showCreateArticleDialog(draft)
  }
  async deleteArticle() {
    const idx = dialog.showMessageBoxSync({
      message: `Are you sure you want to delete ${this.ctxArticle.title}, this could not be undone ?`,
      buttons: ['Cancel', 'Delete'],
    })
    if (idx) {
      let planet = Planet.planets.filter((p) => p.id === this.ctxArticle.planet.id)[0]
      if (!planet) {
        planet = FollowingPlanet.following.filter((p) => p.id === this.ctxArticle.planet.id)[0]
      }
      const article = planet.articles.filter((a) => a.id === this.ctxArticle.id)[0]
      planet.articles = planet.articles.filter((a) => a.id !== this.ctxArticle.id)
      const articles = this.focusInfo.articles.filter((a) => a.id !== this.ctxArticle.id)
      bus.emit('focusInfo', null, {
        ...this.focusInfo,
        focus: articles.length > 0 ? articles[0].id : '',
        articles,
      })
      await article.delete()
    }
  }
  editArticle() {
    const planet = Planet.planets.filter((p) => p.id === this.ctxArticle.planet.id)[0]
    const article = planet.articles.filter((a) => a.id === this.ctxArticle.id)[0]
    let draft
    if (article.drafts.length > 0) {
      draft = article.drafts[0]
    } else {
      draft = Draft.fromArticle(article)
    }
    this.showCreateArticleDialog(draft)
  }
  init() {
    this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/topbar`)
    this.view.setAutoResize({ width: true })
    this.view.webContents.on('did-finish-load', () => {
      this.updateUI()
    })
  }
  async showCreateArticleDialog(draft) {
    const win = BrowserWindow.fromWebContents(this.view.webContents)
    const ArticleEditorDialog = new BrowserWindow({
      parent: win,
      x: win.getPosition()[0] + win.getSize()[0] / 2 - 600,
      y: win.getPosition()[1] + win.getSize()[1] / 2 - 300,
      width: 1200,
      height: 600,
      titleBarStyle: 'hidden',
      trafficLightPosition: {
        x: 18,
        y: 18,
      },
      // transparent: true,
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })

    ArticleEditorDialog.addBrowserView(editorTopbar.view)
    editorTopbar.init(draft)

    ArticleEditorDialog.addBrowserView(editorMain.view)
    editorMain.init(draft)

    ArticleEditorDialog.addBrowserView(editorWebview.view)
    editorWebview.init(draft)

    ArticleEditorDialog.show()
  }
  updateUI() {
    if (!this.view) return
    this.view.webContents.send('topbar', {
      planet: rt.sidebarFocus ? rt.sidebarFocus.json() : {},
      article: rt.middleSideBarFocusArticle
        ? {
            ...rt.middleSideBarFocusArticle.json(),
            url: rt.middleSideBarFocusArticle.url,
            planet: rt.middleSideBarFocusArticle.planet.json(),
          }
        : {},
    })
  }
}

module.exports = new WebviewTopbar()
