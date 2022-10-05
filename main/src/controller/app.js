const { app } = require('electron')
const evt = require('../utils/events')
const { FollowingPlanet, Planet } = require('../models')
const ipfs = require('../utils/ipfs')
const rt = require('../models/runtime')
const wallet = require('../utils/wallet')
require('./upmanager')
require('./mainwindow')
require('./trayIcon')

class ScarboroughApp {
  constructor() {
    //单例运行的第二个实例收到用户启动的消息
    app.on('second-instance', () => evt.emit(evt.evTrayOpen))
    //苹果系统用户点击Dock栏上的残留图标
    app.on('activate', () => evt.emit(evt.evTrayOpen))
    //防止程序退出，程序只能主动退出
    app.on('window-all-closed', () => {})
    //程序退出的时候通知各模块清理自己
    app.on('quit', () => evt.emit(evt.evAppQuit))
  }
  async createWallet() {
    await require('./createWalletWin').show()
  }

  async unlockWallet() {
    await require('./unlockWalletWin').show()
  }

  async start() {
    //首先设置所有内容保存的根目录
    await this.initDirBase()
    //启动前端页面服务器
    await require('../utils/websrv').init()

    //解锁钱包
    await wallet.init()
    if (wallet.needCreate) {
      await this.createWallet()
    } else {
      await this.unlockWallet()
    }

    //加载已经保存的内容
    await this.loadAll()

    //启动api网关，用于服务移动端
    await require('../utils/apisrv').init()

    //各个模块这个时候可以按需做自己的初始化工作
    evt.emit(evt.evAppInit)
    //创建并且显示主窗口
    evt.emit(evt.evCreateWindow)
  }

  async loadAll() {
    await FollowingPlanet.loadFollowing()
    await Planet.loadPlanets()
    if (rt.planets.length > 0) {
      rt.sidebarFocus = rt.planets[0]
    } else {
      rt.sidebarFocus = 'today'
    }
  }

  async initDirBase() {
    FollowingPlanet.followingPlanetsPath = require('path').join(app.__root__, 'Following')
    Planet.myPlanetsPath = require('path').join(app.__root__, 'My')
    ipfs.constructor.REPO_PATH = require('path').join(app.__root__, 'ipfs')
  }
}

module.exports = new ScarboroughApp()
