const ffmpeg = require('fluent-ffmpeg')
const log = require('./log')('ffmpeg')
const OS = require('os').platform()
const FFMPEG_FILE = OS === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
const FFPROBE_FILE = OS === 'win32' ? 'ffprobe.exe' : 'ffprobe'
const FFMPEG_PATH = require('path').join(__dirname, '..', '..', '..', 'ipfsbin', FFMPEG_FILE)
const FFPROBE_PATH = require('path').join(__dirname, '..', '..', '..', 'ipfsbin', FFPROBE_FILE)
if (require('fs').existsSync(FFMPEG_PATH)) {
  process.env.FFMPEG_PATH = FFMPEG_PATH
  log.info(`find ffmpeg at ${FFMPEG_PATH}`)
}
if (require('fs').existsSync(FFPROBE_PATH)) {
  process.env.FFPROBE_PATH = FFPROBE_PATH
  log.info(`find ffprobe at ${FFPROBE_PATH}`)
}

class FFMpeg {
  async cover(path, opt) {
    return new Promise((resolve) => {
      ffmpeg(path)
        .on('end', () => {
          log.debug(`thumbnail for ${path} done!`)
          resolve()
        })
        .on('error', (err, stdout, stderr) => {
          log.error(`extract video thumbnail for ${path} error: ${stdout} ${stderr}`, err)
          resolve()
        })
        .screenshots(opt)
    })
  }
  async preview(media, preview, len) {
    return new Promise((resolve, reject) => {
      ffmpeg(media)
        .on('end', () => {
          resolve()
        })
        .on('error', (ex) => {
          reject(ex)
        })
        .output(preview)
        .duration(len)
        .run()
    })
  }
}

module.exports = new FFMpeg()
