const fs = require('fs')
jest.mock('fs')
fs.readFileSync.mockReturnValue('')
const { FollowingPlanet, Planet } = require('../models')
const ipfs = require('../utils/ipfs')
jest.mock('../utils/ipfs')
test('init base dir', async () => {
  process.env.SCARBOROUGH_ROOT = '/tmp'
  await require('./app').initDirBase()
  expect(FollowingPlanet.followingPlanetsPath.endsWith(require('path').normalize('/tmp/Following'))).toBeTruthy()
  expect(Planet.myPlanetsPath.endsWith(require('path').normalize('/tmp/My'))).toBeTruthy()
  expect(ipfs.constructor.REPO_PATH.endsWith(require('path').normalize('/tmp/ipfs'))).toBeTruthy()
  delete process.env.SCARBOROUGH_ROOT
  require('electron').app.getPath.mockReturnValue('/home/test/document')
  await require('./app').initDirBase()
  expect(FollowingPlanet.followingPlanetsPath).toBe(require('path').normalize('/home/test/document/Following'))
  expect(Planet.myPlanetsPath).toBe(require('path').normalize('/home/test/document/My'))
  expect(ipfs.constructor.REPO_PATH).toBe(require('path').normalize('/home/test/document/ipfs'))
})
