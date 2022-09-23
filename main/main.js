const {app, BrowserWindow, ipcMain} = require('electron')
const planet = require('./src/controller/planet')
const articles = require('./src/controller/articles')
const ipfs = require('./src/utils/ipfs')
const webview = require('./src/controller/webview')
const webviewTopbar = require('./src/controller/webviewTopbar')
const audioPlayer = require('./src/controller/audioplayer')
const {FollowingPlanet, Planet} = require('./src/models/')
const {bus} = require('./src/utils/events')
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: "main"});

let mainWindow
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        vibrancy: 'sidebar',
        visualEffectState: 'followWindow',
        titleBarStyle: 'hidden',
        trafficLightPosition: {
            x: 18,
            y: 18
        }
    })

    mainWindow.addBrowserView(planet.view);
    planet.init()

    mainWindow.addBrowserView(articles.view);
    articles.init()

    mainWindow.addBrowserView(webview.view);
    webview.init()

    mainWindow.addBrowserView(webviewTopbar.view);
    webviewTopbar.init()

    mainWindow.addBrowserView(audioPlayer.view);
    audioPlayer.init()

    mainWindow.once('show', () => {
        bus.emit('rebounds')
    })
}

async function initDirBase() {
    const BASE_ROOT = process.env.SCARBOROUGH_ROOT ? require('path').resolve(process.env.SCARBOROUGH_ROOT) : app.getPath('userData')
    FollowingPlanet.followingPlanetsPath = require('path').join(BASE_ROOT, 'Following')
    Planet.myPlanetsPath = require('path').join(BASE_ROOT, 'My')
    ipfs.constructor.REPO_PATH = require('path').join(BASE_ROOT, 'ipfs')
}

app.whenReady().then(async () => {
    await initDirBase()
    await require('./src/utils/websrv').init()
    ipfs.init()
    await FollowingPlanet.loadFollowing()
    await Planet.loadPlanets()
    FollowingPlanet.startUpdate()
    Planet.startPublish()
    planet.createView()
    articles.createView()
    webview.createView()
    webviewTopbar.createView()
    audioPlayer.createView()

    ipcMain.on('triggleRootPanel', () => {
        const views = mainWindow.getBrowserViews()
        let root
        if (views.indexOf(planet.view) >= 0) { // need remove planet view
            mainWindow.removeBrowserView(planet.view)
            root = false
        } else { // need append planet view
            mainWindow.addBrowserView(planet.view)
            root = true
        }
        bus.emit('rebounds', null, {root})
    })

    const rebounds = (p = {}) => {
        this.boundsProps = {
            ...(this.boundsProp || {
                root: true,
                player: false
            }),
            ...p
        }
        const {root, player} = this.boundsProps
        const [width, height] = mainWindow.getSize()
        log.info('reounds with props', {root, player, width, height})
        planet.view.setBounds({x: 0, y: 0, width: 300, height})
        articles.view.setBounds({
            x: root ? 300 : 0,
            y: 0,
            width: 300,
            height
        })
        webviewTopbar.view.setBounds({
            x: root ? 600 : 300,
            y: 0,
            width: root ? width - 600 : width - 300,
            height: 48
        })
        audioPlayer.view.setBounds({
            x: root ? 600 : 300,
            y: 49,
            width: root ? width - 600 : width - 300,
            height: player ? 48 : 0
        })
        webview.view.setBounds({
            x: root ? 600 : 300,
            y: player ? 97 : 49,
            width: root ? width - 600 : width - 300,
            height: player ? height - 96 : height - 48
        })
    };
    bus.on('rebounds', rebounds)

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
    setTimeout(() => {
        createWindow()
    }, 300);
})

app.on('quit', async () => {
    await ipfs.ipfsShutdown()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
