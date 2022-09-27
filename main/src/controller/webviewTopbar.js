const { BrowserView, ipcMain, BrowserWindow, Menu, dialog, app } = require('electron')
const evt = require('../utils/events')
const log = require('../utils/log')('topbar')

const editorTopbar = require('./editor/editorTopbar')
const editorMain = require('./editor/editorMain')
const editorWebview = require('./editor/editorWebview')
const { Draft } = require('../models')
const rt = require('../models/runtime')
const Jimp = require('jimp')

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
      [evt.ipcSetAvatar, this.setPlanetAvatar],
      [evt.ipcDownloadMenu, this.showDownloadMenu],
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

  showDownloadMenu(event) {
    if (!rt.middleSideBarFocusArticle) return
    if (!rt.middleSideBarFocusArticle.attachments) return
    const win = BrowserWindow.fromWebContents(event.sender)
    const downloadMenu = Menu.buildFromTemplate(
      Array.from(
        new Set([
          ...rt.middleSideBarFocusArticle.attachments.map((a) => a.name || a),
          ...(rt.middleSideBarFocusArticle.audioFilename ? [rt.middleSideBarFocusArticle.audioFilename] : []),
          ...(rt.middleSideBarFocusArticle.videoFilename ? [rt.middleSideBarFocusArticle.videoFilename] : []),
        ])
      ).map((item) => ({
        label: item,
        click: () => {
          this.downloadAttachment(item)
        },
      }))
    )
    downloadMenu.popup(win)
  }

  async downloadAttachment(item) {
    let base = rt.middleSideBarFocusArticle.url
    if (base.endsWith('.html')) {
      base = base.slice(0, -5)
    }
    if (!base.endsWith('/')) {
      base = base + '/'
    }
    const url = base + item
    const localFile = require('path').join(app.getPath('downloads'), item)
    await require('../utils/download')(url, localFile, { open: true })
  }

  showMyArticleCtxMenu(event, a) {
    const win = BrowserWindow.fromWebContents(event.sender)
    this.ctxArticle = a
    let planet = rt.planets.filter((p) => p.id === a.planet.id)[0]
    if (planet) {
      this.articleCtxMenu.popup(win)
    }
  }

  async setPlanetAvatar(event) {
    const win = BrowserWindow.fromWebContents(event.sender)
    const pathes = dialog.showOpenDialogSync(win, {
      message: 'attach a photo',
      filters: [
        {
          name: 'Images',
          extensions: ['jpeg', 'jpg', 'png', 'gif'],
        },
      ],
      properties: ['openFile'],
    })
    if (pathes && pathes.length > 0) {
      const image = await Jimp.read(pathes[0])
      log.info('need store avatar at:', rt.sidebarFocus.avatarPath)
      image.resize(256, 256).quality(80).write(rt.sidebarFocus.avatarPath)
      rt.sidebarFocus.avatar = 'avatar.png'
      await rt.sidebarFocus.save()
      evt.emit(evt.evRuntimePlanetsChange)
      evt.emit(evt.evRuntimeSidebarFocusChange)
      this.updatePlanetInfoWin(win)
      rt.sidebarFocus.publish()
    }
  }

  updatePlanetInfoWin(win) {
    const planet = rt.sidebarFocus
    win.webContents.send('planetInfo', {
      about: require('marked').parse(planet.about),
      updateat: planet.lastRetrieved || planet.lastPublished,
      title: planet.name,
      icon: planet.avatar ? planet.avatarPath : null,
      isMine: !!rt.planets.filter((p) => p.id === planet.id)[0],
    })
  }

  planetInfo() {
    if (!rt.sidebarFocus) return
    const win = BrowserWindow.fromWebContents(this.view.webContents)
    const planetInfoDialog = new BrowserWindow({
      parent: win,
      x: win.getPosition()[0] + win.getSize()[0] / 2 - 200,
      y: win.getPosition()[1] + win.getSize()[1] / 2 - 150,
      width: 400,
      height: 300,
      frame: false,
      resizable: false,
      webPreferences: {
        webSecurity: false,
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    // planetInfoDialog.webContents.openDevTools({ mode: 'undocked' })
    planetInfoDialog.loadURL(`${require('../utils/websrv').WebRoot}/dialog/planet/info`)
    planetInfoDialog.webContents.on('did-finish-load', () => {
      this.updatePlanetInfoWin(planetInfoDialog)
      planetInfoDialog.show()
    })
    // planetInfoDialog.webContents.openDevTools({ mode: 'undocked' })

    // if (!rt.middleSideBarFocusArticle) return
    // let planet = rt.middleSideBarFocusArticle.planet
    // const win = BrowserWindow.fromWebContents(event.sender)
    // dialog.showMessageBoxSync(win, {
    //   message: planet.about,
    //   detail: `update at ${require('moment')(planet.lastRetrieved || planet.lastPublished).format(
    //     'MMM D, YYYY HH:mm:ss'
    //   )}`,
    //   type: 'info',
    //   buttons: ['OK'],
    //   title: planet.name,
    //   icon: planet.avatar ? planet.avatarPath : null,
    // })
  }

  async newArticle() {
    if (!rt.sidebarFocus) return
    const planet = rt.sidebarFocus
    await planet.loadDrafts()
    rt.draft = planet.drafts.length > 0 ? planet.drafts[0] : new Draft(planet)
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

    rt.draft = Draft.fromArticle(article)
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
