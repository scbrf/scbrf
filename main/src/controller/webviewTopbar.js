const {
    BrowserView,
    ipcMain,
    BrowserWindow,
    Menu,
    diaog,
    dialog
} = require('electron')
const {bus} = require('../utils/events')
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: "topbar"});
const editorTopbar = require('./editor/editorTopbar')
const editorMain = require('./editor/editorMain')
const editorWebview = require('./editor/editorWebview')
const {Planet, Draft, FollowingPlanet} = require('../models')

class WebviewTopbar {
    createView() { 
        this.view = new BrowserView({
            webPreferences: {
                preload: require('path').join(__dirname, '..', '..', 'preload.js')
            }
        })
 
        editorTopbar.createView() 
        editorMain.createView()
        editorWebview.createView()

        // this.view.webContents.openDevTools({ mode: 'undocked' })
        ipcMain.on('articleFocus', (_, article) => {
            this.view.webContents.send('topbar', {article})
        })
        ipcMain.on('newArticle', async (_, pp) => {
            const planet = Planet.planets.filter(p => p.id == pp.id)[0]
            let draft = planet.drafts.length > 0 ? planet.drafts[0] : new Draft(planet);
            log.info('when create new draft, created date is:', draft.created)
            this.showCreateArticleDialog(draft)
        })

        ipcMain.on('planetInfo', async (event, pp) => {
            let planet = Planet.planets.filter(p => p.id == pp.id)[0]
            if (! planet) {
                planet = FollowingPlanet.following.filter(p => p.id == pp.id)[0]
            }
            const win = BrowserWindow.fromWebContents(event.sender)
            dialog.showMessageBoxSync(win, {
                message: planet.about,
                detail: `update at ${
                    require('moment')(planet.lastRetrieved || planet.lastPublished).format('MMM D, YYYY HH:mm:ss')
                }`,
                type: 'info',
                buttons: ['OK'],
                title: planet.name,
                icon: planet.avatar ? planet.avatarPath : null
            })
        })

        bus.on('focusPlanet', (planet) => {
            log.info('focus planet change', planet)
            this.focusPlanet = planet
            this.view.webContents.send('topbar', {planet})
        })
        this.articleCtxMenu = Menu.buildFromTemplate([
            {
                label: 'Edit Article',
                click: this.editArticle.bind(this)
            }, {
                label: 'Delete Article',
                click: this.deleteArticle.bind(this)
            }
        ])
        ipcMain.on('articleCtxMenu', (event, p) => {
            const win = BrowserWindow.fromWebContents(event.sender)
            this.articleCtxMenu.popup(win)
            this.ctxArticle = p
        })
    }
    async deleteArticle() {
        const idx = dialog.showMessageBoxSync({
                message: `Are you sure you want to delete ${
                this.ctxArticle.title
            }, this could not be undone ?`,
            buttons: ['Cancel', 'Delete']
        })
        if (idx) {
            let planet = Planet.planets.filter(p => p.id === this.ctxArticle.planet.id)[0]
            if (! planet) {
                planet = FollowingPlanet.following.filter(p => p.id === this.ctxArticle.planet.id)[0]
            }
            const article = planet.articles.filter(a => a.id === this.ctxArticle.id)[0]
            planet.articles = planet.articles.filter(a => a.id !== this.ctxArticle.id)
            const articles = this.focusInfo.articles.filter(a => a.id !== this.ctxArticle.id)
            bus.emit('focusInfo', null, {
                ...this.focusInfo,
                focus: articles.length > 0 ? articles[0].id : '',
                articles
            })
            await article.delete()
        }

    }
    editArticle() {
        const planet = Planet.planets.filter(p => p.id === this.ctxArticle.planet.id)[0]
        const article = planet.articles.filter(a => a.id === this.ctxArticle.id)[0]
        let draft
        if (article.drafts.length > 0) {
            draft = article.drafts[0]
        } else {
            draft = Draft.fromArticle(article)
        }
        this.showCreateArticleDialog(draft)
    }
    init() {
        this.view.webContents.loadURL(`${
            require('../utils/websrv').WebRoot
        }/topbar`)
        this.view.setAutoResize({width: true})
        this.view.webContents.on('did-finish-load', () => {
            if (this.focusPlanet) {
                this.view.webContents.send('topbar', {planet: this.focusPlanet})
            }
        })
    }
    async showCreateArticleDialog(draft) {
        const win = BrowserWindow.fromWebContents(this.view.webContents)
        const ArticleEditorDialog = new BrowserWindow({
            parent: win,
            x: win.getPosition()[0] + win.getSize()[0] / 2 - 600,
            y: win.getPosition()[1] + win.getSize()[1] / 2 - 300,
            width: 1200,
            height: 600,
            titleBarStyle: 'hidden',
            trafficLightPosition: {
                x: 18,
                y: 18
            },
            // transparent: true,
            webPreferences: {
                preload: require('path').join(__dirname, '..', '..', 'preload.js')
            }
        })

        ArticleEditorDialog.addBrowserView(editorTopbar.view);
        editorTopbar.init(draft)

        ArticleEditorDialog.addBrowserView(editorMain.view);
        editorMain.init(draft)

        ArticleEditorDialog.addBrowserView(editorWebview.view);
        editorWebview.init(draft)

        ArticleEditorDialog.show()
    }
}

module.exports = new WebviewTopbar()
