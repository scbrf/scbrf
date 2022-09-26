const { BrowserView, Menu, ipcMain, BrowserWindow } = require('electron')
const { FollowingPlanet } = require('../models')
const evt = require('../utils/events')

class ArticleController {
  constructor() {
    evt.bindBusTable(this, [[evt.evAppInit, this.createView]])
  }

  createView() {
    this.view = new BrowserView({
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    // this.view.webContents.openDevTools({mode: 'undocked'})
    // bus.on('focusInfo', (p) => {
    //   this.focusInfo = p
    //   this.view.webContents.send('articles', p)
    // })
    // bus.on('allreadchange', (pid) => {
    //   this.updateFocusState(FollowingPlanet.following.filter((p) => p.id === pid)[0].articles)
    // })
    // this.view.webContents.on('did-finish-load', () => {
    //   this.view.webContents.send('articles', this.focusInfo)
    // })
    // this.followingArticleCtxMenu = Menu.buildFromTemplate([
    //   {
    //     label: 'Trigger Read',
    //     click: this.triggerRead.bind(this),
    //   },
    //   {
    //     label: 'Trigger Star',
    //     click: this.triggerStar.bind(this),
    //   },
    // ])
    // ipcMain.on('articleCtxMenu', (event, a) => {
    //   const win = BrowserWindow.fromWebContents(event.sender)
    //   this.ctxArticle = a
    //   let planet = FollowingPlanet.following.filter((p) => p.id === a.planet.id)[0]
    //   if (planet) {
    //     this.followingArticleCtxMenu.popup(win)
    //   }
    // })
    // ipcMain.on('articleFocus', async (_, article) => {
    //   if (this.focusInfo) {
    //     this.focusInfo.focus = article.id
    //   }
    //   let planet = FollowingPlanet.following.filter((p) => p.id === article.planet.id)[0]
    //   if (planet) {
    //     const aa = planet.articles.filter((a) => a.id === article.id)[0]
    //     if (aa && !aa.read) {
    //       this.ctxArticle = aa
    //       this.triggerRead()
    //     }
    //   }
    // })
  }
  updateFocusState(articles) {
    for (let article of articles) {
      for (let i = 0; i < this.focusInfo.articles.length; i++) {
        if (this.focusInfo.articles[i].id === article.id) {
          this.focusInfo.articles[i] = {
            ...article.json(),
            url: article.url,
            planet: article.planet.json(),
          }
        }
      }
    }
    this.view.webContents.send('articles', this.focusInfo)
  }
  async triggerRead() {
    const planet = FollowingPlanet.following.filter((p) => p.id === this.ctxArticle.planet.id)[0]
    const article = planet.articles.filter((a) => a.id === this.ctxArticle.id)[0]
    article.read = !article.read
    article.save()
    this.updateFocusState([article])
    bus.emit('article/read/change', null, article.json)
  }
  async triggerStar() {
    const planet = FollowingPlanet.following.filter((p) => p.id === this.ctxArticle.planet.id)[0]
    const article = planet.articles.filter((a) => a.id === this.ctxArticle.id)[0]
    article.starred = !article.starred
    article.read = true
    article.save()
    for (let i = 0; i < this.focusInfo.articles.length; i++) {
      if (this.focusInfo.articles[i].id === article.id) {
        this.focusInfo.articles[i] = article.json()
        break
      }
    }
    this.view.webContents.send('articles', this.focusInfo)
    bus.emit('article/star/change', null, article.json)
  }
  init() {
    this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/articles`)
    this.view.setAutoResize({ height: true })
  }
}

module.exports = new ArticleController()
