const { ipcMain } = require('electron')
const EvtBus = require('js-event-bus')
const log = require('../utils/log')('eventCenter')

class EventCenter {
  //直接在这里定义一个事件名，注意时间名必须用 ev + 任意一个大写字母开头
  /** App Event */
  evCreateWindow //'tell mainwindow to create main window'
  evTrayOpen //'tell mainwindow tray icon clicked'
  evIPFSShutdown // 'tell ipfs module to shutdown ipfs'
  evAppInit // 'tell all module now do init work, and the callback should be sync function'
  evAppQuit // app quit
  evIpfsDaemonReady //ipfs readay

  /**  Runtime event **/
  evRuntimeFollowingChange // '增加或者删除了Following数据，following的某个article内容改变不会触发该事件'
  evRuntimePlanetsChange // '增加或者删除了某个Planet，planet里的某个文章内容改变不会触发该事件'
  evRuntimeNumbersChange // '左侧栏里展示的数字内容发生了变化'
  evRuntimeIpfsOnlinePeersChange // 'ipfs online 或者 peer 状态发生了变化'
  evRuntimeDraftChange // '对应于编辑器的draft实例发生了变化'
  evRuntimeMiddleSidebarContentChange // '中间栏的标题或者内容发生了变化'
  evRuntimeMiddleSidebarFocusChange // '中间栏的关注文章发生了变化'
  evRuntimeSidebarFocusChange //'左侧栏的关注点发生了变化'
  evRuntimeFairChange //集市内容变更

  evRebounds // 重新排列窗口，比如当用户切换左边栏或者切换声音播放器的时候
  evCloseFileHandler //需要更改article的文件内容，之前应该先关闭可能打开的文件句柄

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

  ipcNewArticle //用户在某个Planet新建一个 article
  ipcPlayAudio //用户指定播放音乐
  ipcStopAudio //用户指定停止播放音乐
  ipcPlanetInfo //用户查看某个Planet的信息
  ipcMyArticleCtxMenu //用户在某个Article上点右键

  ipcDraftPublish //发布草稿
  ipcDraftSave //保存草稿
  ipcDraftAddPhoto //增加图片
  ipcDraftAddAudio //增加声音
  ipcDraftAddVideo //增加视频
  ipcDraftAddOnlyFans //增加onlyfans标记
  ipcDraftRemoveAttachment //移除附件
  ipcDraftVideoContextMenu //弹出视频菜单

  ipcSetAvatar //设置Planet的头像
  ipcDownloadMenu //显示下载菜单

  ipcAppQuit //app 安全退出
  ipcOpenFocusInBrowser //在浏览器里打开本地网关预览模式

  ipcCreateWallet //创建密码
  ipcUnlockWallet //解锁钱包

  ipcOpenUrlExternal //在外部浏览器打开
  ipcShareOpen //webview的右上角按钮

  ipcFairRequest //投放到集市

  constructor() {
    this.bus = EvtBus()
    this.eventNameInit()
    this.ipcNameInit()
  }
  bindIpcMainTable(that, table) {
    for (let entry of table) {
      if (!(entry[0] in this.rpcNames)) {
        console.log(new Error().stack)
        throw `Unknown event: ${entry[0]}`
      }
      ipcMain.on(entry[0], entry[1].bind(that))
    }
  }

  bindBusTable(that, table) {
    for (let entry of table) {
      if (!(entry[0] in this.events)) {
        console.log(new Error().stack)
        throw `Unknown event: ${entry[0]}`
      }
      this.bus.on(entry[0], entry[1].bind(that))
    }
  }

  emit(ev) {
    if (!(ev in this.events)) {
      console.log(new Error().stack)
      throw `Unknown event: ${ev}`
    }
    log.debug('event emit', { ev, args: Array.prototype.slice.call(arguments, 1) })
    this.bus.emit(ev, null, ...Array.prototype.slice.call(arguments, 1))
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
