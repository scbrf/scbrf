const fs = require('fs')
jest.mock('fs')
fs.readFileSync.mockReturnValue('')
const { FollowingPlanet, Planet } = require('../models')
const ipfs = require('../utils/ipfs')
jest.mock('../utils/ipfs')

test('init base dir', async () => {
  require('electron').app.__root__ = '/tmp'
  await require('./app').initDirBase()
  expect(FollowingPlanet.followingPlanetsPath.endsWith(require('path').normalize('/tmp/Following'))).toBeTruthy()
  expect(Planet.myPlanetsPath.endsWith(require('path').normalize('/tmp/My'))).toBeTruthy()
  expect(ipfs.constructor.REPO_PATH.endsWith(require('path').normalize('/tmp/ipfs'))).toBeTruthy()
})
