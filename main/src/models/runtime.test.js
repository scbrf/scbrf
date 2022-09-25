const { ipcMain } = require('electron')
let ipcCBs = {}
ipcMain.on.mockImplementation((name, cb) => {
  ipcCBs[name] = cb
})

const runtime = require('./runtime')
const { bus } = require('../utils/events')
const FollowingPlanet = require('./followingPlanet')
const Planet = require('./planet')

test('ipfsOnline', () => {
  const cb = jest.fn()
  bus.on(runtime.events.ipfsOnlinePeersChange, cb)
  expect(runtime.ipfsOnline).toBe(false)
  runtime.ipfsOnline = true
  expect(runtime.ipfsOnline).toBe(true)
  expect(cb).toHaveBeenCalledTimes(1)
})

test('ipfsPeers', () => {
  const cb = jest.fn()
  bus.on(runtime.events.ipfsOnlinePeersChange, cb)
  expect(runtime.ipfsPeers).toBe(0)
  runtime.ipfsPeers = 10
  expect(runtime.ipfsPeers).toBe(10)
  expect(cb).toHaveBeenCalledTimes(1)
})

test('draft', () => {
  const cb = jest.fn()
  bus.on(runtime.events.draftChange, cb)
  expect(runtime.draft).toBe(null)
  runtime.draft = 5
  expect(runtime.draft).toBe(5)
  expect(cb).toHaveBeenCalledTimes(1)
})

test('middleSideBarFocusArticle', () => {
  const cb = jest.fn()
  bus.on(runtime.events.middleSidebarFocusChange, cb)
  expect(runtime.middleSideBarFocusArticle).toBe(null)
  runtime.middleSideBarFocusArticle = 5
  expect(runtime.middleSideBarFocusArticle).toBe(5)
  expect(cb).toHaveBeenCalledTimes(1)
})

test('middleSideBarTitle', () => {
  const cb = jest.fn()
  bus.on(runtime.events.middleSidebarContentChange, cb)
  expect(runtime.middleSideBarTitle).toBe('')
  runtime.middleSideBarTitle = 5
  expect(runtime.middleSideBarTitle).toBe(5)
  expect(cb).toHaveBeenCalledTimes(1)
})

test('middleSideBarArticles', () => {
  const cb = jest.fn()
  bus.on(runtime.events.middleSidebarContentChange, cb)
  expect(runtime.middleSideBarArticles.length).toBe(0)
  runtime.middleSideBarArticles = [1, 2, 3]
  expect(runtime.middleSideBarArticles.length).toBe(3)
  expect(cb).toHaveBeenCalledTimes(1)
})

test('sidebarFocus', () => {
  const cb = jest.fn()
  bus.on(runtime.events.sidebarFocusChange, cb)
  expect(runtime.sidebarFocus).toBe(null)
  runtime.sidebarFocus = 5
  expect(runtime.sidebarFocus).toBe(5)
  expect(cb).toHaveBeenCalledTimes(1)
})

test('set', () => {
  const cb = jest.fn()
  bus.on(runtime.events.middleSidebarContentChange, cb)
  runtime.set({
    middleSideBarArticles: [2, 3, 4, 5],
    middleSideBarTitle: 'new title',
  })
  //   expect(runtime.middleSideBarArticles.length).toBe(4)
  expect(runtime.middleSideBarTitle).toBe('new title')
  expect(cb).toHaveBeenCalledTimes(1)
})

test('ipcSidebarFocus', () => {
  runtime.middleSideBarTitle = ''
  runtime.middleSideBarArticles = []
  FollowingPlanet.following = [
    {
      id: 'test1',
      name: 'test',
      articles: [
        { created: new Date().getTime(), title: 'test1' },
        { created: new Date().getTime() - 1000 * 3600 * 24 * 5, title: 'unread', read: false },
        { created: new Date().getTime() - 1000 * 3600 * 24 * 5, title: 'starred', starred: true },
      ],
    },
  ]
  ipcCBs['setSidebarFocus']('today')
  expect(runtime.sidebarFocus).toBe('today')
  expect(runtime.middleSideBarTitle).toBe('Today')
  expect(runtime.middleSideBarArticles.length).toBe(1)
  expect(runtime.middleSideBarArticles[0].title).toBe('test1')
  expect(runtime.middleSideBarFocusArticle.title).toBe('test1')

  ipcCBs['setSidebarFocus']('unread')
  expect(runtime.sidebarFocus).toBe('unread')
  expect(runtime.middleSideBarTitle).toBe('Unread')
  expect(runtime.middleSideBarArticles.length).toBe(1)
  expect(runtime.middleSideBarArticles[0].title).toBe('unread')
  expect(runtime.middleSideBarFocusArticle.title).toBe('unread')

  ipcCBs['setSidebarFocus']('starred')
  expect(runtime.sidebarFocus).toBe('starred')
  expect(runtime.middleSideBarTitle).toBe('Starred')
  expect(runtime.middleSideBarArticles.length).toBe(1)
  expect(runtime.middleSideBarArticles[0].title).toBe('starred')
  expect(runtime.middleSideBarFocusArticle.title).toBe('starred')

  ipcCBs['setSidebarFocus']('following:test1')
  expect(runtime.sidebarFocus.name).toBe('test')
  expect(runtime.middleSideBarTitle).toBe('test')
  expect(runtime.middleSideBarArticles.length).toBe(3)
  expect(runtime.middleSideBarArticles[0].title).toBe('test1')
  expect(runtime.middleSideBarFocusArticle.title).toBe('test1')

  Planet.planets = [
    {
      id: 'test2',
      name: 'test2',
      articles: [
        { id: 'a1', created: new Date().getTime(), title: 'test2' },
        { id: 'a2', created: new Date().getTime() - 1000 * 3600 * 24 * 5, title: 'unread', read: false },
      ],
    },
  ]
  ipcCBs['setSidebarFocus']('my:test2')
  expect(runtime.sidebarFocus.name).toBe('test2')
  expect(runtime.middleSideBarTitle).toBe('test2')
  expect(runtime.middleSideBarArticles.length).toBe(2)
  expect(runtime.middleSideBarArticles[0].title).toBe('test2')
  expect(runtime.middleSideBarFocusArticle.title).toBe('test2')

  ipcCBs['setMiddleSidebarFocus']('a2')
  expect(runtime.middleSideBarFocusArticle.title).toBe('unread')
})
