const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'models/runtime' })
const { bindIpcMainTable, emit, initDataModel } = require('../utils/events')

class Runtime {
  constructor() {
    //这个模块会emit这些事件
    this.events = {
      ipfsOnlinePeersChange: 'ipfs-online-peers-change',
      draftChange: 'draft-change',
      middleSidebarContentChange: 'middle-sidebar-content-change',
      middleSidebarFocusChange: 'middle-sidebar-focus-change',
      sidebarFocusChange: 'sidebar-focus-change',
    }
    //这个模块拥有下面这些属性定义
    initDataModel(this, {
      ipfsOnline: {
        default: false,
        emit: this.events.ipfsOnlinePeersChange,
      },
      ipfsPeers: {
        default: 0,
        emit: this.events.ipfsOnlinePeersChange,
      },
      draft: {
        default: null,
        emit: this.events.draftChange,
      },
      middleSideBarFocusArticle: {
        default: null,
        emit: this.events.middleSidebarFocusChange,
      },
      middleSideBarTitle: {
        default: '',
        emit: this.events.middleSidebarContentChange,
      },
      middleSideBarArticles: {
        default: [],
        emit: this.events.middleSidebarContentChange,
      },
      sidebarFocus: {
        default: null,
        emit: this.events.sidebarFocusChange,
      },
    })

    //这个模块定义了这些可以从前端传过来的事件
    bindIpcMainTable(this, [
      { setSidebarFocus: this._onIpcSidebarFocus },
      { setMiddleSidebarFocus: this._onIpcMiddleSidebarFocus },
    ])
  }

  _onIpcSidebarFocus(focus) {}

  _onIpcMiddleSidebarFocus(focus) {}
}

module.exports = new Runtime()
