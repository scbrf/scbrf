const {BrowserView, ipcMain} = require('electron')
const bunyan = require('bunyan');
const {bus} = require('../utils/events');
const log = bunyan.createLogger({name: "audioPlayer"});

class AudioPlayerController {
    createView() {
        this.view = new BrowserView({
            webPreferences: {
                preload: require('path').join(__dirname, '..', '..', 'preload.js')
            }
        })
        // this.view.webContents.openDevTools({mode: 'undocked'})
        ipcMain.on('playAudio', (_, p) => {
            const url = `${
                p.url
            }${
                p.audioFilename
            }`
            this.view.webContents.executeJavaScript(`(()=>{
                document.querySelector('#audiotitle').innerText = '${
                p.audioFilename
            }'
                const audio = document.querySelector('audio');
                audio.src = '${url}' 
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
