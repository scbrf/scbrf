const { BrowserView, Menu, clipboard, BrowserWindow, dialog } = require('electron')
const { Planet, FollowingPlanet } = require('../models')

const log = require('../utils/log')('planetView')

const evt = require('../utils/events')
const rt = require('../models/runtime')

const winFromEvt = (e) => BrowserWindow.fromWebContents(e.sender)
class PlanetSidebarController {
  constructor() {
    evt.bindBusTable(this, [
      [evt.evAppInit, this.createView],
      [evt.evRuntimeFollowingChange, this.updateSidebarFollowing],
      [evt.evRuntimePlanetsChange, this.updateSidebarMyPlanets],
      [evt.evRuntimeNumbersChange, this.updateSidebarFollowing],
      [evt.evRuntimeIpfsOnlinePeersChange, this.updateIpfsOnlineState],
      [evt.evRuntimeSidebarFocusChange, this.updateFocus],
    ])

    this.createMenu()
    evt.bindIpcMainTable(this, [
      [evt.ipcCreateFollowMenu, (e) => this.createFollowMenu.popup(winFromEvt(e))],
      [evt.ipcFollowingCtxMenu, this.popupAndStoreP.bind(this, this.followingMenu)],
      [evt.ipcPlanetCtxMenu, this.popupAndStoreP.bind(this, this.planetMenu)],
      [evt.ipcCreatePlanet, this.closeWinAndRun.bind(this, this.createPlanet.bind(this))],
      [evt.ipcFollowPlanet, this.closeWinAndRun.bind(this, this.followWithProgress.bind(this))],
    ])
  }

  popupAndStoreP(menu, e, p) {
    const win = BrowserWindow.fromWebContents(e.sender)
    menu.popup(win)
    this.planetCtxMenuTargetPlanet = p
  }

  async closeWinAndRun(func, e, p) {
    const win = BrowserWindow.fromWebContents(e.sender)
    try {
      await func(p, win)
      win.close()
    } catch (ex) {
      log.error('error', ex)
    }
  }

  async followWithProgress(p, win) {
    const progressFunc = (msg) => {
      win.webContents.executeJavaScript(`(()=>{
                    document.querySelector('.msg').innerText = '${msg}';
                })()`)
    }
    try {
      await this.followPlanet(p, progressFunc)
    } catch (ex) {
      progressFunc(ex.toString())
      throw ex
    }
  }

  createView() {
    this.view = new BrowserView({
      webPreferences: {
        webSecurity: false,
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    // this.view.webContents.openDevTools()
    this.view.webContents.on('did-finish-load', () => {
      this.updateIpfsOnlineState()
      this.updateSidebarMyPlanets()
      this.updateSidebarFollowing()
      this.updateFocus()
    })
  }
  async publishPlanet() {
    const planet = rt.planets.filter((p) => p.id === this.planetCtxMenuTargetPlanet.id)[0]
    await planet.publish()
  }
  async DeletePlanet() {
    const idx = dialog.showMessageBoxSync({
      message: `Are you sure you want to delete ${this.planetCtxMenuTargetPlanet.name}, this could not be undone ?`,
      buttons: ['Cancel', 'Delete'],
    })
    if (idx) {
      const planet = rt.planets.filter((p) => p.id === this.planetCtxMenuTargetPlanet.id)
      rt.planets = rt.planets.filter((p) => p.id !== this.planetCtxMenuTargetPlanet.id)
      if (planet.length > 0) {
        await planet[0].delete()
      }
      rt.planets = [...rt.planets]
    }
  }
  async followPlanetUpdate() {
    const planet = rt.following.filter((p) => p.id === this.planetCtxMenuTargetPlanet.id)[0]
    if (planet) {
      planet.update()
    }
  }
  async UnfollowPlanet() {
    const idx = dialog.showMessageBoxSync({
      message: `Are you sure you want to unfollow ${this.planetCtxMenuTargetPlanet.name} ?`,
      buttons: ['Cancel', 'Unfollow'],
      defaultId: 1,
      cancelId: 0,
    })
    if (idx) {
      const planet = rt.following.filter((p) => p.id === this.planetCtxMenuTargetPlanet.id)
      rt.following = rt.following.filter((p) => p.id !== this.planetCtxMenuTargetPlanet.id)
      if (planet.length > 0) {
        await planet[0].delete()
      }
      rt.following = [...rt.following]
    }
  }
  showFollowPlanetDialog() {
    const win = BrowserWindow.fromWebContents(this.view.webContents)
    const createPlanetDialog = new BrowserWindow({
      parent: win,
      x: win.getPosition()[0] + win.getSize()[0] / 2 - 300,
      y: win.getPosition()[1] + win.getSize()[1] / 2 - 200,
      width: 600,
      height: 400,
      frame: false,
      resizable: false,
      vibrancy: 'content',
      visualEffectState: 'followWindow',
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    // createPlanetDialog.webContents.openDevTools({ mode: 'undocked' })
    createPlanetDialog.loadURL(`${require('../utils/websrv').WebRoot}/dialog/planet/follow`)
    createPlanetDialog.show()
  }
  showCreatePlanetDialog() {
    const win = BrowserWindow.fromWebContents(this.view.webContents)
    const createPlanetDialog = new BrowserWindow({
      parent: win,
      x: win.getPosition()[0] + win.getSize()[0] / 2 - 300,
      y: win.getPosition()[1] + win.getSize()[1] / 2 - 200,
      width: 600,
      height: 400,
      frame: false,
      resizable: false,
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    // createPlanetDialog.webContents.openDevTools({ mode: 'undocked' })
    createPlanetDialog.loadURL(`${require('../utils/websrv').WebRoot}/dialog/planet/create`)
    createPlanetDialog.show()
  }
  async followPlanet(param, progresscb) {
    const { follow } = param
    this.cancelFollow = false
    const planet = await FollowingPlanet.follow(follow, progresscb)
    if (planet && !this.cancelFollow) {
      rt.following = [planet, ...rt.following]
    }
  }
  async createPlanet(param) {
    const planet = await Planet.create(param)
    planet.save()
    rt.planets = [planet, ...rt.planets]
  }
  updateSidebarFollowing() {
    if (!this.view) return
    this.view.webContents.send('numbers', require('../models/runtime').numbers)
    this.view.webContents.send(
      'following',
      require('../models/runtime').following.map((p) => ({
        ...p.json(),
        busy: p.updating,
        avatar: p.avatar ? `file://${p.avatarPath}` : null,
      }))
    )
  }

  updateFocus() {
    if (!this.view) return
    let focus = rt.sidebarFocus
    if (focus.id) {
      let planet = rt.following.filter((p) => p.id === focus.id)[0]
      if (planet) {
        focus = `following:${focus.id}`
      } else {
        focus = `my:${focus.id}`
      }
    }
    this.view.webContents.send('ipfsOnlineState', {
      focus,
    })
  }

  updateIpfsOnlineState() {
    if (!this.view) return
    this.view.webContents.send('ipfsOnlineState', {
      online: rt.ipfsOnline,
      peers: rt.ipfsPeers,
    })
  }

  updateSidebarMyPlanets() {
    if (!this.view) return
    this.view.webContents.send(
      'myplanets',
      rt.planets.map((p) => ({
        ...p.json(),
        busy: p.publishing,
        avatar: p.avatar ? `file://${p.avatarPath}` : null,
      }))
    )
  }

  async init() {
    // Planets SideBar 通讯代理和数据管理
    this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/root`)
    this.view.setAutoResize({ height: true })
    // this.view.webContents.openDevTools()
  }

  createMenu() {
    this.createFollowMenu = Menu.buildFromTemplate([
      {
        label: 'Create Planet',
        click: this.showCreatePlanetDialog.bind(this),
      },
      {
        type: 'separator',
      },
      {
        label: 'Follow Planet',
        click: this.showFollowPlanetDialog.bind(this),
      },
    ])

    this.followingMenu = Menu.buildFromTemplate([
      {
        label: 'Check for update',
        click: this.followPlanetUpdate.bind(this),
      },
      {
        label: 'Copy URL',
        click: () => {
          clipboard.writeText(this.planetCtxMenuTargetPlanet.link)
        },
      },
      {
        label: 'Mark All as Read',
        click: () => {
          const planet = rt.following.filter((p) => p.id === this.planetCtxMenuTargetPlanet.id)[0]
          planet.articles.forEach((a) => {
            if (a.read === false) {
              a.read = true
              a.save()
            }
          })
          rt.following = [...rt.following]
          evt.emit(evt.evRuntimeMiddleSidebarContentChange)
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Unfollow',
        click: this.UnfollowPlanet.bind(this),
      },
    ])

    this.planetMenu = Menu.buildFromTemplate([
      {
        label: 'Copy IPNS',
        click: () => {
          clipboard.writeText(this.planetCtxMenuTargetPlanet.ipns)
        },
      },
      {
        label: 'Publish',
        click: this.publishPlanet.bind(this),
      },
      {
        type: 'separator',
      },
      {
        label: 'Delete',
        click: this.DeletePlanet.bind(this),
      },
    ])
  }
}
module.exports = new PlanetSidebarController()
