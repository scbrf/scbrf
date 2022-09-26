const { FollowingPlanet, Planet } = require('../models')
const ipfs = require('../utils/ipfs')
test('init base dir', async () => {
  process.env.SCARBOROUGH_ROOT = '/tmp'
  await require('./app').initDirBase()
  expect(FollowingPlanet.followingPlanetsPath).toBe('/tmp/Following')
  expect(Planet.myPlanetsPath).toBe('/tmp/My')
  expect(ipfs.constructor.REPO_PATH).toBe('/tmp/ipfs')
  delete process.env.SCARBOROUGH_ROOT
  require('electron').app.getPath.mockReturnValue('/home/test/document')
  await require('./app').initDirBase()
  expect(FollowingPlanet.followingPlanetsPath).toBe('/home/test/document/Following')
  expect(Planet.myPlanetsPath).toBe('/home/test/document/My')
  expect(ipfs.constructor.REPO_PATH).toBe('/home/test/document/ipfs')
})
