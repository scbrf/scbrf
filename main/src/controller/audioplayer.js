const { BrowserView, ipcMain } = require('electron')
const bunyan = require('bunyan')
const evt = require('../utils/events')
const log = bunyan.createLogger({ name: 'audioPlayer' })

class AudioPlayerController {
  constructor() {
    evt.bindBusTable(this, [[evt.evAppInit, this.createView]])
    evt.bindIpcMainTable(this, [
      [evt.ipcPlayAudio, this.playAudio],
      [evt.ipcStopAudio, this.stopAudio],
    ])
  }
  createView() {
    this.view = new BrowserView({
      webPreferences: {
        webSecurity: false,
        preload: require('path').join(__dirname, '..', '..', 'preload.js'),
      },
    })
    // this.view.webContents.openDevTools({mode: 'undocked'})
  }
  init() {
    this.view.webContents.loadURL(`${require('../utils/websrv').WebRoot}/player`)
    this.view.setAutoResize({ width: true })
  }
  stopAudio() {
    this.view.webContents.executeJavaScript(`(()=>{
      document.querySelector('#audiotitle').innerText = ''
      const audio = document.querySelector('audio');
      audio.pause();
  })()`)
    evt.emit(evt.evRebounds, { player: false })
  }
  playAudio(_, p) {
    log.info('need play audio at', p.url, p.audioFilename)
    let base = p.url.replace(/\\/g, '/')
    if (!base.endsWith('/')) {
      base = base.split('/').slice(0, -1).join('/') + '/'
    }
    const url = `${base}${p.audioFilename}`
    log.info('real play at', url)
    this.view.webContents.executeJavaScript(`(()=>{
              document.querySelector('#audiotitle').innerText = '${p.audioFilename}'
              const audio = document.querySelector('audio');
              audio.src = '${url}' 
              audio.play();
          })()`)
    evt.emit(evt.evRebounds, { player: true })
  }
}

module.exports = new AudioPlayerController()
