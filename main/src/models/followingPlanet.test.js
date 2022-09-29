const fs = require('fs')
const axios = require('axios')
require('../utils/ipfs')
const follow = require('./followingPlanet')
const rt = require('../models/runtime')
const wallet = require('../utils/wallet')

jest.mock('fs')
jest.mock('../utils/ipfs')
jest.mock('../utils/wallet')
jest.mock('axios')

follow.followingPlanetsPath = '/tmp'
test('load following', async () => {
  fs.readdir.mockImplementation((dir, cb) => {
    cb(null, ['aaa.json'])
  })
  fs.existsSync.mockReturnValue(true)
  fs.readFileSync.mockReturnValue(
    JSON.stringify({
      title: 'test',
      content: 'dummy',
    })
  )
  await follow.loadFollowing()
  expect(rt.following.length).toBe(1)
  expect(rt.following[0].articles.length).toBe(1)
  expect(rt.following[0].articles[0].title).toBe('test')
})

test('refollow', async () => {
  rt.following = []
  wallet.resolveENS.mockReturnValue('ipfs://xxxx')
  axios.get.mockReturnValue({
    data: {
      pipe: () => {},
      name: 'planet1',
      id: 'bbb',
      articles: [
        {
          id: 'aaa',
          title: 'article1',
          content: 'dummy',
        },
      ],
    },
  })
  fs.createWriteStream.mockReturnValue({
    on(msg, cb) {
      if (msg === 'finish') cb()
    },
  })
  const planet = await follow.follow('olivida.eth', () => {})
  expect(rt.following.length).toBe(0)
  expect(planet.name).toBe('planet1')
  expect(planet.updating).toBeFalsy()
  expect(planet.articles.length).toBe(1)
  expect(planet.articles[0].title).toBe('article1')
  rt.following = [planet]
  const lasttime = planet.lastRetrieved
  planet.articles[0].read = true
  planet.articles[0].starred = true
  await rt.following[0].update()
  expect(rt.following.length).toBe(1)
  expect(rt.following[0].lastRetrieved).toBeGreaterThan(lasttime)
  expect(rt.following[0].articles[0].read).toBe(true)
  expect(rt.following[0].articles[0].starred).toBe(true)

  //test delete file
  axios.get.mockReturnValue({
    data: {
      pipe: () => {},
      name: 'planet1',
      id: 'bbb',
    },
  })
  await rt.following[0].update()
  expect(rt.following.length).toBe(1)
  expect(rt.following[0].articles.length).toBe(0)
})
