const { BrowserView, Menu, clipboard, BrowserWindow, dialog } = require('electron')
const { Planet, FollowingPlanet, Article } = require('../models')
const ipfs = require('../utils/ipfs')

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
      [evt.ipcOpenFocusInBrowser, this.openFocusInBrowser],
      [evt.ipcOnlyfansRegisterPlanetRequest, this.doRegisterPlanet],
      [evt.ipcOnlyfansSubscribePlanetRequest, this.doSubscribePlanet],
    ])
  }

  async doSubscribePlanet(event, p) {
    const win = BrowserWindow.fromWebContents(event.sender)
    const { passwd, pubkey, price, days } = p
    const error = await this.subscribePlanetAction(passwd, pubkey, price, days)
    if (error) {
      win.webContents.send('subscribe-onlyfans-request', {
        error,
      })
    } else {
      win.close()
    }
  }

  async doRegisterPlanet(event, p) {
    const win = BrowserWindow.fromWebContents(event.sender)
    const { passwd, price } = p
    const error = await this.registerPlanetAction(price, passwd)
    if (error) {
      win.webContents.send('register-onlyfans-request', {
        error,
      })
    } else {
      win.close()
    }
  }

  async subscribePlanetAction(passwd, pubkey, price, days) {
    if (!(await require('../utils/wallet').validatePasswd(passwd))) {
      return '密码错误'
    }
    try {
      const tx = await require('../utils/wallet').subscribePlanet(pubkey, price, days)
      const rsp = await tx.wait()
      log.info('onlyfans subscribe planet return', rsp)
    } catch (ex) {
      log.debug('onlyfans subscribe planet error', ex)
      return ex.message
    }
  }

  async registerPlanetAction(price, passwd) {
    if (!(await require('../utils/wallet').validatePasswd(passwd))) {
      return '密码错误'
    }

    const pk = await require('../utils/wallet').ipfsPkFromId(this.planetCtxMenuTargetPlanet.id)
    const ed = require('@noble/ed25519')
    const ipns = await ed.getPublicKey(pk)
    const signature = await ed.sign(Buffer.from(require('../utils/wallet').wallet.address.toUpperCase()), pk)

    try {
      const tx = await require('../utils/wallet').registerPlanet(ipns, signature, price)
      const rsp = await tx.wait()
      log.info('onlyfans register planet return', rsp)
    } catch (ex) {
      log.debug('onlyfans register planet error', ex)
      return ex.message
    }
  }

  popupAndStoreP(menu, e, p) {
    const win = BrowserWindow.fromWebContents(e.sender)
    menu.popup(win)
    log.debug('popup and store called with', p)
    this.planetCtxMenuTargetPlanet = rt.following.filter((pp) => pp.id == p.id)[0]
    if (!this.planetCtxMenuTargetPlanet) {
      this.planetCtxMenuTargetPlanet = rt.planets.filter((pp) => pp.id == p.id)[0]
    }
  }

  async openFocusInBrowser() {
    let planet = rt.middleSideBarFocusArticle.planet
    require('electron').shell.openExternal(`http://127.0.0.1:${ipfs.gatewayPort}/ipns/${planet.ipns || planet.link}/`)
  }

  async closeWinAndRun(func, e, p) {
    const win = BrowserWindow.fromWebContents(e.sender)
    try {
      await func(p, win)
      win.close()
    } catch (ex) {
      log.error('error, dialog may keep opened', ex)
    }
  }

  async followWithProgress(p, win) {
    const progressFunc = (msg) => {
      log.debug(`progress message: ${msg}`)
      win.webContents.executeJavaScript(`(()=>{
                    document.querySelector('.msg').innerText = '${msg}';
                })()`)
    }
    try {
      await this.followPlanet(p, progressFunc)
    } catch (ex) {
      log.error('error when follow planet', ex)
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

  async rebuildPlanet() {
    const planet = rt.planets.filter((p) => p.id === this.planetCtxMenuTargetPlanet.id)[0]
    await planet.rebuild()
  }

  async publishPlanet() {
    const planet = rt.planets.filter((p) => p.id === this.planetCtxMenuTargetPlanet.id)[0]
    await planet.republish()
  }
  async DeletePlanet() {
    const idx = dialog.showMessageBoxSync({
      message: `Are you sure you want to delete ${this.planetCtxMenuTargetPlanet.name}, this could not be undone ?`,
      buttons: ['Cancel', 'Delete'],
      defaultId: 1,
      cancelId: 0,
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
      if (planet.length > 0) {
        await planet[0].delete()
      }
      rt.set({
        following: rt.following.filter((p) => p.id !== this.planetCtxMenuTargetPlanet.id),
        middleSideBarArticles: rt.middleSideBarArticles.filter(
          (a) => a.planet.id !== this.planetCtxMenuTargetPlanet.id
        ),
        middleSideBarFocusArticle:
          rt.middleSideBarFocusArticle && rt.middleSideBarFocusArticle.planet.id === this.planetCtxMenuTargetPlanet.id
            ? null
            : rt.middleSideBarFocusArticle,
      })
    }
  }
  showSiteQRDialog() {
    const win = BrowserWindow.fromWebContents(this.view.webContents)
    const qrDialog = new BrowserWindow({
      parent: win,
      x: win.getPosition()[0] + win.getSize()[0] / 2 - 300,
      y: win.getPosition()[1] + win.getSize()[1] / 2 - 150,
      width: 400,
      height: 400,
      frame: false,
      resizable: false,
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    // qrDialog.webContents.openDevTools({ mode: 'undocked' })
    qrDialog.loadURL(`${require('../utils/websrv').WebRoot}/dialog/planet/qrcode`)
    qrDialog.webContents.on('did-finish-load', () => {
      qrDialog.webContents.send('updatePlanetUrl', require('../utils/apisrv').getPlanetUrl())
    })
    qrDialog.show()
  }
  showFollowPlanetDialog() {
    const win = BrowserWindow.fromWebContents(this.view.webContents)
    const createPlanetDialog = new BrowserWindow({
      parent: win,
      x: win.getPosition()[0] + win.getSize()[0] / 2 - 300,
      y: win.getPosition()[1] + win.getSize()[1] / 2 - 150,
      width: 600,
      height: 300,
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
      height: 350,
      frame: false,
      resizable: false,
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    // createPlanetDialog.webContents.openDevTools({ mode: 'undocked' })
    createPlanetDialog.loadURL(`${require('../utils/websrv').WebRoot}/dialog/planet/create`)
    createPlanetDialog.webContents.on('did-finish-load', () => {
      if (rt.planetEditing) {
        createPlanetDialog.webContents.send('create-edit-planet', rt.planetEditing.json())
      }
    })
    createPlanetDialog.show()
  }
  async followPlanet(param, progresscb = () => {}) {
    const { follow } = param
    this.cancelFollow = false
    const planet = await FollowingPlanet.follow(follow, progresscb)
    if (planet && !this.cancelFollow) {
      rt.set({
        following: [...rt.following, planet],
        sidebarFocus: planet,
      })
    }
  }
  async createPlanet(param) {
    let planet
    if (param.id) {
      if (rt.planetEditing == null) {
        //maybe from phone
        rt.planetEditing = rt.planets.filter((p) => p.id === param.id)[0]
      }
      if (rt.planetEditing && param.id === rt.planetEditing.id) {
        planet = rt.planetEditing
        rt.planetEditing.name = param.name
        rt.planetEditing.about = param.about
        rt.planetEditing.commentsBridge = param.commentsBridge || rt.planetEditing.commentsBridge
        if (rt.planetEditing.template !== param.template) {
          rt.planetEditing.template = param.template
        }
        rt.planetEditing = null
        log.info('change planet properties to', param)
      } else {
        log.error('fe and be not match!!', { fe: param.id, be: rt.planetEditing.id })
        return
      }
    } else {
      planet = await Planet.create(param)
    }
    await planet.save()
    if (!param.id) {
      rt.planets = [planet, ...rt.planets]
    }
    if (planet.articles.length > 0) {
      planet.publish()
    }
    rt.sidebarFocus = planet
    evt.emit(evt.evRuntimePlanetsChange)
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

  async doImportPlanet() {
    const win = BrowserWindow.fromBrowserView(this.view)
    const pathes = dialog.showOpenDialogSync(win, {
      message: 'Import Planet',
      filters: [
        {
          name: 'Planet',
          extensions: ['planet'],
        },
      ],
    })
    const base = pathes[0]
    const planetPath = require('path').join(base, 'planet.json')
    const planetJson = JSON.parse(require('fs').readFileSync(planetPath).toString())
    const planet = new Planet({
      ...planetJson,
      created: require('../utils/datetime').timeFromReferenceDate(planetJson.created),
      updated: require('../utils/datetime').timeFromReferenceDate(planetJson.updated),
    })
    if (require('fs').existsSync(planet.basePath)) {
      dialog.showMessageBoxSync(win, {
        message: '目录已存在',
        type: 'error',
      })
      return
    }
    if (rt.planets.filter((p) => p.id === planet.id)[0]) {
      dialog.showMessageBoxSync(win, {
        message: 'ID 已存在',
        type: 'error',
      })
      return
    }
    require('fs').mkdirSync(planet.basePath)
    require('fs').mkdirSync(planet.publicBasePath)
    require('fs').mkdirSync(planet.articlesPath)
    require('fs').mkdirSync(planet.articleDraftsPath)

    const keyPath = require('path').join(base, 'planet.key')
    const avatarPath = require('path').join(base, 'avatar.png')
    const articlesPath = require('fs')
      .readdirSync(base)
      .map((a) => require('path').join(base, a))
      .filter((a) => require('fs').existsSync(require('path').join(a, 'article.json')))
    planet.articles = articlesPath.map((a) => {
      const aJson = JSON.parse(require('fs').readFileSync(require('path').join(a, 'article.json')).toString())
      return new Article(planet, {
        ...aJson,
        attachments: (aJson.attachments || [])
          .filter((a) => a != aJson.audioFilename)
          .filter((a) => a != aJson.videoFilename)
          .map((a) => ({ name: a })),
        created: require('../utils/datetime').timeFromReferenceDate(aJson.created),
        updated: require('../utils/datetime').timeFromReferenceDate(aJson.updated),
      })
    })
    if (require('fs').existsSync(avatarPath)) {
      require('fs').copyFileSync(avatarPath, planet.avatarPath)
      planet.avatar = 'avatar.png'
    }
    await planet.save()
    await Promise.all(planet.articles.map((a) => a.save()))
    await Promise.all(
      planet.articles.map((a) =>
        require('fs').cpSync(require('path').join(base, a.id), a.publicBase, { recursive: true })
      )
    )
    await planet.copyTemplateAssets()
    await planet.publicRender()
    await Promise.all(planet.articles.map((a) => a.publicRender()))
    try {
      await require('../utils/ipfs').importKey(planet.id, keyPath)
    } catch (ex) {
      if (ex.message.indexOf('already exists') < 0) {
        require('fs').rmSync(planet.basePath, { recursive: true, force: true })
        dialog.showMessageBoxSync(win, {
          message: ex.message,
          type: 'error',
        })
        return
      }
    }
    rt.planets = [planet, ...rt.planets]
  }

  async init() {
    // Planets SideBar 通讯代理和数据管理
    this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/root`)
    this.view.setAutoResize({ height: true })
    // this.view.webContents.openDevTools()
  }

  async onlyfansSubscribe() {
    let ipns = this.planetCtxMenuTargetPlanet.ipns
    log.info(`target link is ${this.planetCtxMenuTargetPlanet.link} resolve as ${ipns}`)
    if (!ipns.startsWith('12D3')) {
      return require('electron').dialog.showMessageBoxSync({
        message: `This planet ${this.planetCtxMenuTargetPlanet.name} can not be subscribed!`,
        buttons: ['OK'],
        cancelId: 0,
      })
    }

    const { base58_to_binary } = require('base58-js')
    const pubkey = base58_to_binary(ipns).slice(6)
    log.info('decode ipns got', pubkey)
    const info = await require('../utils/wallet').onlyfansPlanetInfo(pubkey)
    log.debug('query onlyfans planet info return', info)
    if (!info) {
      return require('electron').dialog.showMessageBoxSync({
        message: `This planet ${this.planetCtxMenuTargetPlanet.name} not registed at onlyfans!`,
        buttons: ['OK'],
        cancelId: 0,
      })
    }
    const [price, owner, signature] = info
    log.debug('planet info', owner, signature)
    const ed = require('@noble/ed25519')
    const isValid = await ed.verify(
      Buffer.from(signature.substring(2), 'hex'),
      Buffer.from(owner.toUpperCase()),
      pubkey
    )
    if (!isValid) {
      return require('electron').dialog.showMessageBoxSync({
        message: `This planet ${this.planetCtxMenuTargetPlanet.name} has wrong signature!`,
        buttons: ['OK'],
        cancelId: 0,
      })
    }
    const win = BrowserWindow.fromWebContents(this.view.webContents)
    const subwin = new BrowserWindow({
      parent: win,
      x: win.getPosition()[0] + win.getSize()[0] / 2 - 300,
      y: win.getPosition()[1] + win.getSize()[1] / 2 - 225,
      width: 600,
      height: 470,
      frame: false,
      resizable: false,
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    subwin.loadURL(`${require('../utils/websrv').WebRoot}/dialog/onlyfans/subscribe`)
    subwin.webContents.on('did-finish-load', async () => {
      const info = await this.subscribeOnlyfansPrepare(
        this.planetCtxMenuTargetPlanet,
        pubkey,
        require('ethers').utils.formatEther(price)
      )
      log.debug('subscribe onlyfans info', info)
      subwin.webContents.send('subscribe-onlyfans-request', info)
    })
    subwin.show()
  }

  async registerOnlyfans() {
    const pk = await require('../utils/wallet').ipfsPkFromId(this.planetCtxMenuTargetPlanet.id)
    const ed = require('@noble/ed25519')
    const ipns = await ed.getPublicKey(pk)
    const info = await require('../utils/wallet').onlyfansPlanetInfo(ipns)
    if (info) {
      log.info('already registed', info)
      return
    }
    const win = BrowserWindow.fromWebContents(this.view.webContents)
    const subwin = new BrowserWindow({
      parent: win,
      x: win.getPosition()[0] + win.getSize()[0] / 2 - 300,
      y: win.getPosition()[1] + win.getSize()[1] / 2 - 225,
      width: 600,
      height: 470,
      frame: false,
      resizable: false,
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    subwin.loadURL(`${require('../utils/websrv').WebRoot}/dialog/onlyfans/register`)
    subwin.webContents.on('did-finish-load', async () => {
      const info = await this.registerOnlyfansPrepare(this.planetCtxMenuTargetPlanet)
      log.debug('register onlyfans info', info)
      subwin.webContents.send('register-onlyfans-request', info)
    })
    subwin.show()
  }

  async subscribeOnlyfansPrepare(planet, ipns, price) {
    const balance = await require('../utils/wallet').balance()
    const gas = await require('../utils/wallet').estimateGasForSubscribeOnlyfans(ipns, price, 1)
    const info = {
      address: require('../utils/wallet').wallet.address,
      balance,
      gas,
      planet: planet.name,
      price,
      pubkey: '0x' + Buffer.from(ipns).toString('hex'),
    }
    return info
  }

  async registerOnlyfansPrepare(planet) {
    const balance = await require('../utils/wallet').balance()
    const pk = await require('../utils/wallet').ipfsPkFromId(planet.id)
    const ed = require('@noble/ed25519')
    const ipns = await ed.getPublicKey(pk)
    const price = '0.0001'
    const signature = await ed.sign(Buffer.from(require('../utils/wallet').wallet.address.toUpperCase()), pk)
    const gas = await require('../utils/wallet').estimateGasForRegisterOnlyfans(ipns, signature, price)
    const info = {
      address: require('../utils/wallet').wallet.address,
      balance,
      gas,
      planet: planet.name,
    }
    return info
  }

  createMenu() {
    this.createFollowMenu = Menu.buildFromTemplate([
      {
        label: 'Create Planet',
        click: () => {
          rt.planetEditing = null
          this.showCreatePlanetDialog()
        },
      },
      {
        label: 'Follow Planet',
        click: this.showFollowPlanetDialog.bind(this),
      },
      {
        type: 'separator',
      },
      {
        label: 'Site QrCode',
        click: this.showSiteQRDialog.bind(this),
      },
      {
        type: 'separator',
      },
      {
        label: 'Import Planet',
        click: this.doImportPlanet.bind(this),
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
        label: 'Onlyfans Subscribe',
        click: this.onlyfansSubscribe.bind(this),
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
        label: 'Developer',
        submenu: [
          {
            label: 'Rebuild',
            click: this.rebuildPlanet.bind(this),
          },
        ],
      },
      {
        type: 'separator',
      },
      {
        label: 'Edit Planet',
        click: () => {
          rt.planetEditing = rt.planets.filter((p) => p.id === this.planetCtxMenuTargetPlanet.id)[0]
          this.showCreatePlanetDialog()
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Register Onlyfans',
        click: this.registerOnlyfans.bind(this),
      },
      {
        label: 'Change Subscribe Price',
        click: () => {},
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
