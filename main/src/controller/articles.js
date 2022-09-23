const {
    BrowserView,
    ipcMain,
    Menu,
    BrowserWindow,
    dialog
} = require('electron')
const {FollowingPlanet, Planet} = require('../models')
const {bus} = require('../utils/events')

class ArticleController {
    createView() {
        this.view = new BrowserView({
            webPreferences: {
                preload: require('path').join(__dirname, '..', '..', 'preload.js')
            }
        })
        // this.view.webContents.openDevTools({mode: 'undocked'})
    }

    init() {
        this.view.webContents.loadURL(`${
            require('../utils/websrv').WebRoot
        }/articles`)
        this.view.setAutoResize({height: true})

        bus.on('focusInfo', (p) => {
            this.focusInfo = p
            this.view.webContents.send('articles', p)
        })
        this.view.webContents.on('did-finish-load', () => {
            this.view.webContents.send('articles', this.focusInfo)
        })
    }
}

module.exports = new ArticleController()
