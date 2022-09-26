const follow = require('./followingPlanet')

const fs = require('fs')
jest.mock('fs')
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
  expect(require('./runtime').following.length).toBe(1)
  expect(require('./runtime').following[0].articles.length).toBe(1)
  expect(require('./runtime').following[0].articles[0].title).toBe('test')
})
