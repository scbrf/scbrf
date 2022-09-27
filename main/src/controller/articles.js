const { BrowserView, Menu, ipcMain, BrowserWindow } = require('electron')
const evt = require('../utils/events')
const rt = require('../models/runtime')

class ArticleController {
  constructor() {
    evt.bindBusTable(this, [
      [evt.evAppInit, this.createView],
      [evt.evRuntimeMiddleSidebarContentChange, this.updateMiddleSidebarUI],
      [evt.evRuntimeMiddleSidebarFocusChange, this.markFocusReaded],
      [evt.evRuntimeMiddleSidebarFocusChange, this.updateMiddleSidebarUI],
    ])
    evt.bindIpcMainTable(this, [[evt.ipcMyArticleCtxMenu, this.showArticlesCtxMenu]])
  }

  createView() {
    this.view = new BrowserView({
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    // this.view.webContents.openDevTools({mode: 'undocked'})
    this.view.webContents.on('did-finish-load', () => {
      this.updateMiddleSidebarUI()
    })
    this.followingArticleCtxMenu = Menu.buildFromTemplate([
      {
        label: 'Trigger Read',
        click: this.triggerRead.bind(this),
      },
      {
        label: 'Trigger Star',
        click: this.triggerStar.bind(this),
      },
    ])
  }
  showArticlesCtxMenu(event, a) {
    const win = BrowserWindow.fromWebContents(event.sender)
    this.ctxArticle = a
    let planet = rt.following.filter((p) => p.id === a.planet.id)[0]
    if (planet) {
      this.followingArticleCtxMenu.popup(win)
    }
  }
  updateMiddleSidebarUI() {
    if (!this.view) return
    this.view.webContents.send('articles', {
      title: rt.middleSideBarTitle,
      articles: rt.middleSideBarArticles.map((a) => ({
        ...a.json(),
        url: a.url,
        planet: a.planet.json(),
      })),
      focus: rt.middleSideBarFocusArticle ? rt.middleSideBarFocusArticle.id : '',
    })
  }

  markFocusReaded() {
    if (rt.middleSideBarFocusArticle && rt.middleSideBarFocusArticle.read === false) {
      this.ctxArticle = rt.middleSideBarFocusArticle
      this.triggerRead()
    }
  }

  async triggerRead() {
    let pi = null,
      ai = null
    for (let i = 0; i < rt.following.length; i++) {
      if (rt.following[i].id === this.ctxArticle.planet.id) {
        pi = i
        break
      }
    }
    if (pi === null) {
      log.error('no following planet found, should not happen', this.ctxArticle)
      return
    }
    for (let i = 0; i < rt.following[pi].articles.length; i++) {
      if (rt.following[pi].articles[i].id === this.ctxArticle.id) {
        ai = i
        break
      }
    }
    if (ai === null) {
      log.error('no following article found, should not happen', this.ctxArticle)
      return
    }
    const article = rt.following[pi].articles[ai]
    article.read = !article.read
    article.save()
    rt.following = [...rt.following]
  }
  async triggerStar() {
    let pi = null,
      ai = null
    for (let i = 0; i < rt.following.length; i++) {
      if (rt.following[i].id === this.ctxArticle.planet.id) {
        pi = i
        break
      }
    }
    if (pi === null) {
      log.error('no following planet found, should not happen', this.ctxArticle)
      return
    }
    for (let i = 0; i < rt.following[pi].articles.length; i++) {
      if (rt.following[pi].articles[i].id === this.ctxArticle.id) {
        ai = i
        break
      }
    }
    if (ai === null) {
      log.error('no following article found, should not happen', this.ctxArticle)
      return
    }
    const article = rt.following[pi].articles[ai]
    article.starred = !article.starred
    article.read = true
    article.save()
    rt.following = [...rt.following]
  }
  init() {
    this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/articles`)
    this.view.setAutoResize({ height: true })
  }
}

module.exports = new ArticleController()
