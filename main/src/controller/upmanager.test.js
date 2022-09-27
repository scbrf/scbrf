require('fs')
require('../utils/ipfs')
const upm = require('./upmanager')
const rt = require('../models/runtime')
jest.mock('fs')
jest.mock('../utils/ipfs')
test('first round', () => {
  const func1 = jest.fn()
  const func2 = jest.fn()
  rt.planets = []
  rt.following = []
  rt.planets.push({ id: 'p1', publish: func1 })
  rt.following.push({ id: 'f1', update: func2 })
  upm.doCheck()
  expect(upm.upSchedule.p1).toBeTruthy()
  expect(upm.upSchedule.f1).toBeTruthy()
  expect(func1).toHaveBeenCalledTimes(0)
  expect(func2).toHaveBeenCalledTimes(0)
  const before = new Date().getTime() - 24 * 3600 * 1000
  upm.upSchedule.p1 = before
  upm.upSchedule.f1 = before
  upm.doCheck()
  expect(upm.upSchedule.p1).toBeGreaterThan(new Date().getTime())
  expect(upm.upSchedule.f1).toBeGreaterThan(new Date().getTime())
  expect(func1).toHaveBeenCalledTimes(1)
  expect(func2).toHaveBeenCalledTimes(1)
  rt.planets.splice(0, 1)
  upm.upSchedule.p1 = before
  upm.upSchedule.f1 = before
  upm.doCheck()
  expect(func1).toHaveBeenCalledTimes(1)
  expect(func2).toHaveBeenCalledTimes(2)
})
