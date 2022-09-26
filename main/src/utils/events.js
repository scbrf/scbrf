const { ipcMain } = require('electron')
const EvtBus = require('js-event-bus')
const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'event center' })

class EventCenter {
  //直接在这里定义一个事件名，注意时间名必须用 ev + 任意一个大写字母开头
  /** App Event */
  evCreateWindow //'tell mainwindow to create main window'
  evTrayOpen //'tell mainwindow tray icon clicked'
  evIPFSShutdown // 'tell ipfs module to shutdown ipfs'
  evAppInit // 'tell all module now do init work, and the callback should be sync function'
  evAppQuit // app quit

  /**  Runtime event **/
  evRuntimeFollowingChange // '增加或者删除了Following数据，following的某个article内容改变不会触发该事件'
  evRuntimePlanetsChange // '增加或者删除了某个Planet，planet里的某个文章内容改变不会触发该事件'
  evRuntimeNumbersChange // '左侧栏里展示的数字内容发生了变化'
  evRuntimeIpfsOnlinePeersChange // 'ipfs online 或者 peer 状态发生了变化'
  evRuntimeDraftChange // '对应于编辑器的draft实例发生了变化'
  evRuntimeMiddleSidebarContentChange // '中间栏的标题或者内容发生了变化'
  evRuntimeMiddleSidebarFocusChange // '中间栏的关注文章发生了变化'
  evRuntimeSidebarFocusChange //'左侧栏的关注点发生了变化'

  evRebounds // 重新排列窗口，比如当用户切换左边栏或者切换声音播放器的时候

  //直接在这里定义歌 ipc 的通道名，必须以 ipc + 任意一个大写字母开头
  ipcSetSidebarFocus //前端网页通过ipc通道设置侧边栏的 focus 节点
  ipcSetMiddleSidebarFocus //通过ipc通道设置中间栏的 focus 节点
  ipcCloseWin //关闭窗口
  ipcMinimalWin //最小化
  ipcTriggleRootPanel //打开或者关闭左边栏

  ipcCreateFollowMenu //左边栏底端按钮用户点击加号，会弹出上下文菜单
  ipcFollowingCtxMenu //用户在左边栏关注的某个Planet上点右键
  ipcPlanetCtxMenu //用户在左边栏创建的某个Planet上点右键
  ipcCreatePlanet //用户选择创建一个新的Planet菜单
  ipcFollowPlanet //用户选择关注一个新的Planet菜单

  constructor() {
    this.bus = EvtBus()
    this.eventNameInit()
    this.ipcNameInit()
  }
  bindIpcMainTable(that, table) {
    for (let entry of table) {
      ipcMain.on(entry[0], entry[1].bind(that))
    }
  }

  bindBusTable(that, table) {
    for (let entry of table) {
      this.bus.on(entry[0], entry[1].bind(that))
    }
  }

  emit(ev) {
    if (!(ev in this.events)) {
      console.log(new Error().stack)
      throw `Unknown event: ${ev}`
    }
    log.info('event emit', { ev, args: Array.prototype.slice.call(arguments, 1) })
    this.bus.emit(ev, null, Array.prototype.slice.call(arguments, 1))
  }

  eventNameInit() {
    this.events = {}
    Object.keys(this).forEach((k) => {
      if (k.match(/ev[A-Z]/)) {
        this[k] = k
        this.events[k] = k
      }
    })
  }
  ipcNameInit() {
    this.rpcNames = {}
    Object.keys(this).forEach((k) => {
      if (k.match(/ipc[A-Z]/)) {
        this[k] = k
        this.rpcNames[k] = k
      }
    })
  }
}

module.exports = new EventCenter()
