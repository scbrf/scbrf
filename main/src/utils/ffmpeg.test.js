const ffmpeg = require('./ffmpeg')

jest.setTimeout(30000)
test('cover', async () => {
  const coverDir = require('fs').mkdtempSync(require('path').join(require('os').tmpdir(), `test_cover_`))
  await ffmpeg.cover(require('path').join(__dirname, '../../../e2e/attachments/video.mp4'), {
    timestamps: ['1%'],
    filename: 'cover.png',
    folder: coverDir,
    size: '1024x?',
  })
  expect(require('fs').existsSync(require('path').join(coverDir, 'cover.png'))).toBeTruthy()
  require('fs').rmSync(coverDir, { recursive: true })
})

test('preview video', async () => {
  const previewDir = require('fs').mkdtempSync(require('path').join(require('os').tmpdir(), `test_preview_`))
  console.log('preview dir is', previewDir)
  await ffmpeg.preview(
    require('path').join(__dirname, '../../../e2e/attachments/video.mp4'),
    require('path').join(previewDir, 'preview.mp4'),
    30
  )
  expect(require('fs').existsSync(require('path').join(previewDir, 'preview.mp4'))).toBeTruthy()
  require('fs').rmSync(previewDir, { recursive: true })
})
