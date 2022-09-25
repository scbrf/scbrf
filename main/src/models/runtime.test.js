const runtime = require('./runtime')
const { bus } = require('../utils/events')
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
