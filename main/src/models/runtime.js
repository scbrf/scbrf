const log = require('../utils/log')('models/runtime')

const evt = require('../utils/events')
const moment = require('moment')

class Runtime {
  ipfsOnline = [false, evt.evRuntimeIpfsOnlinePeersChange, 'ipfs 在线状态']
  ipfsPeers = [0, evt.evRuntimeIpfsOnlinePeersChange, 'ipfs实例远端数量']
  following = [[], evt.evRuntimeFollowingChange, '正在关注的Planet列表']
  planets = [[], evt.evRuntimePlanetsChange, '自己创建的Planet列表']
  numbers = [{}, evt.evRuntimeNumbersChange, '左侧边栏里显示的数量']

  planetEditing = [null, null, '增在编辑的Planet实例']
  draft = [null, evt.evRuntimeDraftChange, '当前编辑窗口正在编辑的草稿']
  middleSideBarFocusArticle = [null, evt.evRuntimeMiddleSidebarFocusChange, '正在浏览的文章']

  middleSideBarTitle = ['', evt.evRuntimeMiddleSidebarContentChange, '中间窗口的标题']
  middleSideBarArticles = [[], evt.evRuntimeMiddleSidebarContentChange, '中间窗口文章列表']
  sidebarFocus = [null, evt.evRuntimeSidebarFocusChange, '左边栏关注内容']

  constructor() {
    //这个模块定义了这些可以从前端传过来的事件
    evt.bindIpcMainTable(this, [
      [evt.ipcSetSidebarFocus, this.#onIpcSidebarFocus],
      [evt.ipcSetMiddleSidebarFocus, this.#onIpcMiddleSidebarFocus],
    ])

    evt.bindBusTable(this, [
      [evt.evRuntimeSidebarFocusChange, this.updateMiddleSidebarOnChange],
      [evt.evRuntimeFollowingChange, this.updateNumber],
      [evt.evRuntimePlanetsChange, this.updateNumber],
    ])

    this.initDataModel()
  }

  updateNumber() {
    const ret = {}
    this.following.forEach((p) => {
      p.articles.forEach((a) => {
        if (moment(a.created).isSame(moment(), 'day')) {
          ret.today = (ret.today || 0) + 1
        }
        if (a.read === false) {
          ret.read = (ret.read || 0) + 1
        }
        if (a.starred === true) {
          ret.starred = (ret.starred || 0) + 1
        }
      })
      ret[`following:${p.id}`] = p.articles.filter((a) => a.read === false).length
    })
    this.numbers = ret
  }

  updateMiddleSidebarOnChange() {
    const focus = this.sidebarFocus || ''
    if (focus.articles) {
      this.set({
        middleSideBarTitle: focus.name,
        middleSideBarArticles: focus.articles,
        middleSideBarFocusArticle: focus.articles[0],
      })
    } else if (focus === 'today') {
      const articles = this.following.reduce((r, p) => {
        return [...r, ...p.articles.filter((a) => moment(a.created).isSame(moment(), 'day'))]
      }, [])
      articles.sort((a, b) => b.created - a.created)
      this.set({
        middleSideBarTitle: 'Today',
        middleSideBarArticles: articles,
        middleSideBarFocusArticle: articles[0],
      })
    } else if (focus === 'unread') {
      const articles = this.following.reduce((r, p) => {
        return [...r, ...p.articles.filter((a) => a.read === false)]
      }, [])
      articles.sort((a, b) => b.created - a.created)
      this.set({
        middleSideBarTitle: 'Unread',
        middleSideBarArticles: articles,
        middleSideBarFocusArticle: articles[0],
      })
    } else if (focus === 'starred') {
      const articles = this.following.reduce((r, p) => {
        return [...r, ...p.articles.filter((a) => a.starred === true)]
      }, [])
      articles.sort((a, b) => b.created - a.created)
      this.set({
        middleSideBarTitle: 'Starred',
        middleSideBarArticles: articles,
        middleSideBarFocusArticle: articles[0],
      })
    }
  }

  /**
   * 私有函数。 传入的参数是字符串 today unread starred 或者 my:xxxxx follow:xxxx
   * @param {*} focus
   */
  #onIpcSidebarFocus(_, focus) {
    let sidebarFocus = focus || ''
    log.info('ipc set sidebar focus', focus)
    if (sidebarFocus.startsWith('my:')) {
      const planet = this.planets.filter((a) => a.id === focus.substring('my:'.length))[0]
      sidebarFocus = planet
    } else if (sidebarFocus.startsWith('following:')) {
      const planet = this.following.filter((p) => p.id === focus.substring('following:'.length))[0]
      sidebarFocus = planet
    }
    this.sidebarFocus = sidebarFocus
  }

  #onIpcMiddleSidebarFocus(_, focus) {
    this.middleSideBarFocusArticle = this.middleSideBarArticles.filter((a) => a.id == focus)[0]
  }

  /**
   * 简化Model的声音，model只需要关注业务逻辑即可
   * @param {*} that 通常为某个类的 prototype
   * @param {*} model { name:{ default, emit } }
   */
  initDataModel() {
    const model = {}
    for (let name of Object.keys(this)) {
      if (this[name].length === 3 && typeof this[name][2] === 'string') {
        const [defValue, event, desc] = this[name]
        model[name] = this[name]
        Object.defineProperty(this, name, {
          get() {
            //get 函数会直接返回一个内部private变量的值或者是默认的值
            return this[`#${name}`] || defValue
          },
          set(v) {
            //set 函数会设置这个内部private变量的值，如果定义了emit，则在值改变的时候emit一个事件
            this[`#${name}`] = v
            log.debug('runtime change data model prop value', { key: name, v })
            if (event) {
              evt.emit(event, { src: 'set' })
            }
          },
        })
      }
    }

    //同时会定义一个set原型函数，这个函数可以同时设置多个值
    //如果这些值对应相同的emit事件，则会被优化，避免事件多次emit
    this.set = function (obj) {
      const events = new Set()
      for (let key in obj) {
        if (key in model) {
          this[`#${key}`] = obj[key]
          log.debug('runtime change data model prop value', { key, value: obj[key] })
          if (model[key][1]) {
            events.add(model[key][1])
          }
        }
      }
      for (let ev of Array.from(events)) {
        evt.emit(ev, { src: 'set' })
      }
    }
  }
}

module.exports = new Runtime()
