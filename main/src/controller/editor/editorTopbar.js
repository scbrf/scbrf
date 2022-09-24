const {BrowserView} = require('electron')
class EditorTopbar {
    createView() {
        this.view = new BrowserView({
            webPreferences: {
                preload: require('path').join(__dirname, '..', '..', '..', 'preload.js')
            }
        })
    }
    init() {
        this.view.setBounds({x: 0, y: 0, width: 1200, height: 48})
        this.view.webContents.loadURL(`${
            require('../../utils/websrv').WebRoot
        }/editor/topbar`)
        this.view.setAutoResize({width: true})
    }
}

module.exports = new EditorTopbar()
