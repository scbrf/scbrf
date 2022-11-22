const fs = require('fs')
const ffmpeg = require('../utils/ffmpeg')
const wallet = require('../utils/wallet')
require('nunjucks')
const ipfs = require('../utils/ipfs')
require('image-size')
fs.readFileSync.mockReturnValueOnce('')
const { Article, Planet, Draft } = require('./')
jest.mock('fs')
jest.mock('nunjucks')
jest.mock('image-size')
jest.mock('../utils/ipfs')
jest.mock('../utils/wallet')
jest.mock('../utils/ffmpeg')
wallet.wallet = {
  addres: 'test',
}

Planet.myPlanetsPath = '/tmp/my'
Planet.PublicRoot = '/tmp/public'

let mockfs = new Set()

let cpcb
fs.copyFile.mockImplementation((a, b, cb) => {
  mockfs.add(b)
  cpcb = cb
})
fs.copyFileSync.mockImplementation((a, b) => {
  mockfs.add(b)
})
fs.cpSync.mockImplementation((a, b) => {
  mockfs.add(b)
})
fs.mkdtempSync.mockImplementation((prefix) => `${prefix}/${new Date().getTime()}`)
fs.renameSync.mockImplementation((a, b) => {
  mockfs = new Set(
    Array.from(mockfs).map((entry) => {
      if (entry.startsWith(a)) return entry.replace(a, b)
      return entry
    })
  )
})
wallet.myfans.mockReturnValue([{ addr: '11', pubkey: require('ethers').Wallet.createRandom().publicKey.substring(2) }])
ipfs.addDirectory.mockReturnValue('cid123')

function mockfsExists(path) {
  return mockfs.has(path)
}

test('create planet draft', async () => {
  const draft = new Draft(new Planet({ id: 'p1' }), null, { id: 'd1' })
  await draft.addPhotos(['/tmp/a.png', '/tmp/b.jpg'])
  expect(draft.attachments.length).toBe(2)
  expect(draft.attachments[0].name).toBe('a.png')
  expect(draft.attachments[0].url).toBe('file://' + require('path').normalize('/tmp/my/p1/Drafts/D1/Attachments/a.png'))
  expect(mockfsExists('/tmp/my/p1/Drafts/D1/Attachments/a.png')).toBeTruthy()
  await draft.attachAudio('/tmp/b.mp3')
  expect(draft.audioFilename).toBe('/tmp/b.mp3')
  await expect(draft.attachAudio('/tmp/c.mp3')).rejects.toThrowError('Conflict')
  cpcb()
  expect(draft.audioFilename).toBe(require('path').normalize('/tmp/my/p1/Drafts/D1/Attachments/b.mp3'))
  draft.attachAudio('/tmp/c.mp3')
  expect(draft.audioFilename).toBe('/tmp/c.mp3')
  expect(mockfsExists('/tmp/my/p1/Drafts/D1/Attachments/b.mp3')).toBeTruthy()
  cpcb()
  expect(draft.audioFilename).toBe(require('path').normalize('/tmp/my/p1/Drafts/D1/Attachments/c.mp3'))

  await draft.attachVideo('/tmp/b.mp4')
  expect(draft.videoFilename).toBe('/tmp/b.mp4')
  await expect(draft.attachVideo('/tmp/c.mp4')).rejects.toThrowError('Conflict')
  cpcb()
  expect(draft.videoFilename).toBe(require('path').normalize('/tmp/my/p1/Drafts/D1/Attachments/b.mp4'))
  expect(mockfsExists('/tmp/my/p1/Drafts/D1/Attachments/b.mp4')).toBeTruthy()
  draft.attachVideo('/tmp/c.mp4')
  expect(draft.videoFilename).toBe('/tmp/c.mp4')
  cpcb()
  expect(draft.videoFilename).toBe(require('path').normalize('/tmp/my/p1/Drafts/D1/Attachments/c.mp4'))
})

test('draft from article', async () => {
  const article = new Article(new Planet({ id: 'p1' }), {
    id: 'a1',
    title: 'test',
    content: 'this is a test',
    audioFilename: 'a.mp3',
    videoFilename: 'b.mp4',
    attachments: [{ name: 'c.jpg' }, { name: 'd.png' }],
  })
  const draft = Draft.fromArticle(article)
  expect(draft.id).toBe(article.id)
  expect(draft.audioFilename).toBe(require('path').normalize('/tmp/public/p1/A1/a.mp3'))
  expect(draft.videoFilename).toBe(require('path').normalize('/tmp/public/p1/A1/b.mp4'))
  expect(draft.attachments[0].name).toBe('c.jpg')

  const a2 = Article.fromDraft(draft)
  expect(a2.attachments[0].name).toBe('c.jpg')
  expect(a2.audioFilename).toBe('a.mp3')
  expect(a2.videoFilename).toBe('b.mp4')
})

test('publish draft contains fansonly tag', async () => {
  const draft = new Draft(new Planet({ id: 'p1' }), null, {
    id: 'd1',
    content: 'this is a test <img src="c111.jpg" /> <fansonly preview=180 /> other content <img src="d111.png" />',
    audioFilename: '/tmp/my/p1/Drafts/D1/Attachments/a111.mp3',
    videoFilename: '/tmp/my/p1/Drafts/D1/Attachments/b111.mp4',
    attachments: [{ name: 'c111.jpg' }, { name: 'd111.png' }],
  })
  await draft.publish()
  expect(mockfsExists('/tmp/public/p1/D1/c111.jpg')).toBeTruthy()
  expect(mockfsExists('/tmp/public/p1/D1/d111.png')).toBeFalsy()
  expect(mockfsExists('/tmp/public/fansonly/p1/D1/c111.jpg')).toBeTruthy()
  expect(mockfsExists('/tmp/public/fansonly/p1/D1/d111.png')).toBeTruthy()
})
