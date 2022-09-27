const { app } = require('electron')
const evt = require('../utils/events')
const { FollowingPlanet, Planet } = require('../models')
const ipfs = require('../utils/ipfs')
const rt = require('../models/runtime')
require('./upmanager')
require('./mainwindow')

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
  async start() {
    //首先设置所有内容保存的根目录
    await this.initDirBase()
    //加载已经保存的内容
    await this.loadAll()
    //启动前端页面服务器
    await require('../utils/websrv').init()
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
    const BASE_ROOT = process.env.SCARBOROUGH_ROOT
      ? require('path').resolve(process.env.SCARBOROUGH_ROOT)
      : app.getPath('userData')
    FollowingPlanet.followingPlanetsPath = require('path').join(BASE_ROOT, 'Following')
    Planet.myPlanetsPath = require('path').join(BASE_ROOT, 'My')
    ipfs.constructor.REPO_PATH = require('path').join(BASE_ROOT, 'ipfs')
  }
}

module.exports = new ScarboroughApp()
