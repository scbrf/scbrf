const { BrowserView, ipcMain, BrowserWindow, Menu, diaog, dialog } = require('electron')
const evt = require('../utils/events')
const log = require('../utils/log')('topbar')

const editorTopbar = require('./editor/editorTopbar')
const editorMain = require('./editor/editorMain')
const editorWebview = require('./editor/editorWebview')
const { Draft } = require('../models')
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
    let planet = rt.planets.filter((p) => p.id === a.planet.id)[0]
    if (planet) {
      this.articleCtxMenu.popup(win)
    }
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

  async newArticle() {
    if (!rt.sidebarFocus) return
    const planet = rt.sidebarFocus
    let draft = planet.drafts.length > 0 ? planet.drafts[0] : new Draft(planet)
    log.info('when create new draft, created date is:', draft.created)
    rt.draft = draft
    await rt.draft.save()
    this.showCreateArticleDialog()
  }
  async deleteArticle() {
    const idx = dialog.showMessageBoxSync({
      message: `Are you sure you want to delete ${this.ctxArticle.title}, this could not be undone ?`,
      buttons: ['Cancel', 'Delete'],
    })
    if (idx) {
      let planet = rt.planets.filter((p) => p.id === this.ctxArticle.planet.id)[0]
      const article = planet.articles.filter((a) => a.id === this.ctxArticle.id)[0]
      planet.articles = planet.articles.filter((a) => a.id !== this.ctxArticle.id)
      await article.delete()
      //删除操作一般只会影响当前列表
      const articles = rt.middleSideBarArticles.filter((a) => a.id !== article.id)
      let focusArticle
      if (rt.middleSideBarFocusArticle && article.id === rt.middleSideBarFocusArticle.id) {
        for (let i = 0; i < rt.middleSideBarArticles.length; i++) {
          if (rt.middleSideBarArticles[i].id === article.id) {
            if (i > 0) {
              focusArticle = rt.middleSideBarArticles[i - 1]
            } else if (rt.middleSideBarArticles.length > 0) {
              focusArticle = rt.middleSideBarArticles[1]
            }
          }
        }
      }
      rt.set({
        middleSideBarArticles: articles,
        middleSideBarFocusArticle: focusArticle,
      })
    }
  }
  async editArticle() {
    const planet = rt.planets.filter((p) => p.id === this.ctxArticle.planet.id)[0]
    const article = planet.articles.filter((a) => a.id === this.ctxArticle.id)[0]
    let draft
    if (article.drafts.length > 0) {
      draft = article.drafts[0]
    } else {
      draft = Draft.fromArticle(article)
    }
    rt.draft = draft
    await rt.draft.save()
    this.showCreateArticleDialog()
  }
  init() {
    this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/topbar`)
    this.view.setAutoResize({ width: true })
    this.view.webContents.on('did-finish-load', () => {
      this.updateUI()
    })
  }
  async showCreateArticleDialog() {
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
    editorTopbar.init()

    ArticleEditorDialog.addBrowserView(editorMain.view)
    editorMain.init()

    ArticleEditorDialog.addBrowserView(editorWebview.view)
    editorWebview.init()

    ArticleEditorDialog.show()
  }
  updateUI() {
    if (!this.view) return
    this.view.webContents.send('topbar', {
      planet: rt.sidebarFocus && rt.sidebarFocus.json ? rt.sidebarFocus.json() : {},
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
