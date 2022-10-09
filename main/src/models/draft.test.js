const fs = require('fs')
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
wallet.wallet = {
  addres: 'test',
}

Planet.myPlanetsPath = '/tmp'
let cpcb
fs.copyFile.mockImplementation((_, __, cb) => {
  cpcb = cb
})

test('create planet draft', async () => {
  const draft = new Draft(new Planet({ id: 'p1' }), null, { id: 'd1' })
  await draft.addPhotos(['/tmp/a.png', '/tmp/b.jpg'])
  expect(draft.attachments.length).toBe(2)
  expect(draft.attachments[0].name).toBe('a.png')
  expect(draft.attachments[0].url).toBe('file://' + require('path').normalize('/tmp/p1/Drafts/D1/Attachments/a.png'))
  await draft.attachAudio('/tmp/b.mp3')
  expect(draft.audioFilename).toBe('/tmp/b.mp3')
  await expect(draft.attachAudio('/tmp/c.mp3')).rejects.toThrowError('Conflict')
  cpcb()
  expect(draft.audioFilename).toBe(require('path').normalize('/tmp/p1/Drafts/D1/Attachments/b.mp3'))
  draft.attachAudio('/tmp/c.mp3')
  expect(draft.audioFilename).toBe('/tmp/c.mp3')
  cpcb()
  expect(draft.audioFilename).toBe(require('path').normalize('/tmp/p1/Drafts/D1/Attachments/c.mp3'))

  await draft.attachVideo('/tmp/b.mp4')
  expect(draft.videoFilename).toBe('/tmp/b.mp4')
  await expect(draft.attachVideo('/tmp/c.mp4')).rejects.toThrowError('Conflict')
  cpcb()
  expect(draft.videoFilename).toBe(require('path').normalize('/tmp/p1/Drafts/D1/Attachments/b.mp4'))
  draft.attachVideo('/tmp/c.mp4')
  expect(draft.videoFilename).toBe('/tmp/c.mp4')
  cpcb()
  expect(draft.videoFilename).toBe(require('path').normalize('/tmp/p1/Drafts/D1/Attachments/c.mp4'))
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
  expect(draft.audioFilename).toBe(require('path').normalize('/tmp/p1/Public/A1/a.mp3'))
  expect(draft.videoFilename).toBe(require('path').normalize('/tmp/p1/Public/A1/b.mp4'))
  expect(draft.attachments[0].name).toBe('c.jpg')

  const a2 = Article.fromDraft(draft)
  expect(a2.attachments[0].name).toBe('c.jpg')
  expect(a2.audioFilename).toBe('a.mp3')
  expect(a2.videoFilename).toBe('b.mp4')
})

test('publish pending on wait copy audio', async () => {
  const draft = new Draft(new Planet({ id: 'p1' }), null, {
    id: 'A1',
    title: 'test',
    content: 'this is a test',
  })
  await draft.attachAudio('/tmp/a.mp3')
  let publishDone = false
  draft.publish().then(() => {
    publishDone = true
  })
  await new Promise((resolve) => setTimeout(resolve, 150))
  expect(publishDone).toBe(false)
  cpcb()
  await new Promise((resolve) => setTimeout(resolve, 150))
  expect(publishDone).toBe(true)
})

test('publish pending on wait copy video', async () => {
  const draft = new Draft(new Planet({ id: 'p1' }), null, {
    id: 'a1',
    title: 'test',
    content: 'this is a test',
  })
  await draft.attachVideo('/tmp/a.mp4')
  let publishDone = false
  draft.publish().then(() => {
    publishDone = true
  })
  await new Promise((resolve) => setTimeout(resolve, 150))
  expect(publishDone).toBe(false)
  cpcb()
  await new Promise((resolve) => setTimeout(resolve, 150))
  expect(publishDone).toBe(true)
})

test('remove juke files', async () => {
  const draft = new Draft(new Planet({ id: 'p1' }), null, {
    id: 'A1',
    title: 'test',
    content: 'this is a test',
    attachments: [{ name: 'a.png' }, { name: 'b.png' }],
  })
  const targets = []
  fs.renameSync.mockImplementation((s, t) => {
    targets.push(t)
  })
  fs.existsSync.mockReturnValue(true)
  fs.rmSync = jest.fn()
  await draft.removeAttachment('b.png')
  await draft.publish()
  if (process.platform === 'win32') {
    expect(targets.length).toBe(0)
    expect(fs.rmSync).toHaveBeenCalledTimes(1) //rm draft
  } else {
    expect(targets.length).toBe(1)
    expect(fs.rmSync).toHaveBeenCalledTimes(2) //rm public and rm draft
  }
})

test('load old draft on create new', async () => {})

test('load old draft on edit article', async () => {})
