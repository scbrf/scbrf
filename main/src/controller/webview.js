const {BrowserView, ipcMain, BrowserWindow} = require('electron')
const bunyan = require('bunyan');
const {bus} = require('../utils/events')
const log = bunyan.createLogger({name: "webview"});

class Webview {
    createView() {
        this.view = new BrowserView({
            webPreferences: {
                webSecurity: false,
                preload: require('path').join(__dirname, '..', '..', 'preload.js')
            }
        })
        this.view.webContents.on('will-navigate', (e, url) => {
            if (!url.startsWith('http://')) {
                e.preventDefault();
                require('electron').shell.openExternal(url);
            }
            log.info('need open url', url)
            // return { action: 'deny' };
        });
        // this.view.webContents.openDevTools({mode: 'undocked'})
        ipcMain.on('articleFocus', (_, p) => {
            this.view.webContents.loadURL(p.url, {userAgent: 'Planet/JS'})
        })
        bus.on('focusInfo', (p) => {
            if (p.focus) {
                const article = p.articles.filter(a => a.id === p.focus)[0]
                if (article) {
                    this.view.webContents.loadURL(article.url, {userAgent: 'Planet/JS'})
                }
            } else {
                this.view.webContents.loadURL(`${
                    require('../utils/websrv').WebRoot
                }/loading`, {userAgent: 'Planet/JS'})
            }
        })
    }
    init() {
        this.view.webContents.loadURL(`${
            require('../utils/websrv').WebRoot
        }/loading`)
        this.view.setAutoResize({height: true, width: true})
    }
}

module.exports = new Webview()
