const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'models/runtime' })
const { bindIpcMainTable, initDataModel } = require('../utils/events')
const FollowingPlanet = require('./followingPlanet')
const Planet = require('./planet')
const moment = require('moment')

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
      { setSidebarFocus: this.#onIpcSidebarFocus },
      { setMiddleSidebarFocus: this.#onIpcMiddleSidebarFocus },
    ])
  }

  /**
   * 私有函数。 传入的参数是字符串 today unread starred 或者 my:xxxxx follow:xxxx
   * @param {*} focus
   */
  #onIpcSidebarFocus(focus) {
    let sidebarFocus = focus
    if (focus === 'today') {
      const articles = FollowingPlanet.following.reduce((r, p) => {
        return [...r, ...p.articles.filter((a) => moment(a.created).isSame(moment(), 'day'))]
      }, [])
      articles.sort((a, b) => b.created - a.created)
      this.set({
        sidebarFocus,
        middleSideBarTitle: 'Today',
        middleSideBarArticles: articles,
        middleSideBarFocusArticle: articles[0],
      })
    } else if (focus === 'unread') {
      const articles = FollowingPlanet.following.reduce((r, p) => {
        return [...r, ...p.articles.filter((a) => a.read === false)]
      }, [])
      this.set({
        sidebarFocus,
        middleSideBarTitle: 'Unread',
        middleSideBarArticles: articles,
        middleSideBarFocusArticle: articles[0],
      })
    } else if (focus === 'starred') {
      const articles = FollowingPlanet.following.reduce((r, p) => {
        return [...r, ...p.articles.filter((a) => a.starred === true)]
      }, [])
      this.set({
        sidebarFocus,
        middleSideBarTitle: 'Starred',
        middleSideBarArticles: articles,
        middleSideBarFocusArticle: articles[0],
      })
    } else if (focus.startsWith('my:')) {
      const planet = Planet.planets.filter((a) => a.id === focus.substring('my:'.length))[0]
      sidebarFocus = planet
      this.set({
        sidebarFocus,
        middleSideBarTitle: planet.name,
        middleSideBarArticles: planet.articles,
        middleSideBarFocusArticle: planet.articles[0],
      })
    } else if (focus.startsWith('following:')) {
      const planet = FollowingPlanet.following.filter((p) => p.id === focus.substring('following:'.length))[0]
      sidebarFocus = planet
      this.set({
        sidebarFocus,
        middleSideBarTitle: planet.name,
        middleSideBarArticles: planet.articles,
        middleSideBarFocusArticle: planet.articles[0],
      })
    }
  }

  #onIpcMiddleSidebarFocus(focus) {
    //focus == article.id
    this.middleSideBarFocusArticle = this.middleSideBarArticles.filter((a) => a.id == focus)[0]
  }
}

module.exports = new Runtime()
