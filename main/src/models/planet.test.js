const fs = require('fs')
jest.mock('fs')
fs.readFileSync.mockImplementation((path) => {
  if (path.endsWith('WriterBasic.html')) {
    return `{{ content_html }}`
  }
})

const axios = require('axios')
require('../utils/ipfs')
const { Planet, Article } = require('./')
const rt = require('../models/runtime')
const wallet = require('../utils/wallet')
const render = require('../utils/render')
jest.mock('../utils/render')
jest.mock('../utils/ipfs')
jest.mock('../utils/wallet')
jest.mock('axios')
render.getEnv.mockReturnValue({
  render() {},
})
Planet.myPlanetsPath = '/tmp'

test('republish', async () => {
  const planet = new Planet({ id: 'aaa' })
  planet.articles.push(new Article(planet, { id: 'bbb', title: 'aaa', content: 'aaa' }))
  expect(planet.id).toBe('aaa')
  expect(planet.articles.length).toBe(1)
  const lastpub = planet.lastPublished
  await planet.publish()
  expect(planet.lastPublished).toBeGreaterThan(lastpub)
})
