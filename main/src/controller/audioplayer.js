const {BrowserView, ipcMain} = require('electron')
const bunyan = require('bunyan');
const {bus} = require('../utils/events');
const { basename } = require('path');
const log = bunyan.createLogger({name: "audioPlayer"});

class AudioPlayerController {
    createView() {
        this.view = new BrowserView({
            webPreferences: {
                webSecurity:false,
                preload: require('path').join(__dirname, '..', '..', 'preload.js')
            }
        })
        // this.view.webContents.openDevTools({mode: 'undocked'})
        ipcMain.on('playAudio', (_, p) => {
            log.info('need play audio at', p.url, p.audioFilename)
            let base = p.url
            if ((!p.url.endsWith('/')) && (!p.url.endsWith('\\'))) {
                base = require('path').dirname(p.url)
            }
            const url =require('path').join(base, p.audioFilename)
            log.info('real play at', url)
            this.view.webContents.executeJavaScript(`(()=>{
                document.querySelector('#audiotitle').innerText = '${
                p.audioFilename
            }'
                const audio = document.querySelector('audio');
                audio.src = '${url.replace(/\\/g, "\\\\")}' 
                audio.play();
            })()`)
            bus.emit('rebounds', null, {player: true})
        })
        ipcMain.on('stopAudio', () => {
            this.view.webContents.executeJavaScript(`(()=>{
                document.querySelector('#audiotitle').innerText = ''
                const audio = document.querySelector('audio');
                audio.pause();
            })()`)
            bus.emit('rebounds', null, {player: false})
        })
    }
    init() {
        this.view.webContents.loadURL(`${
            require('../utils/websrv').WebRoot
        }/player`)
        this.view.setAutoResize({width: true})
    }
}

module.exports = new AudioPlayerController()
