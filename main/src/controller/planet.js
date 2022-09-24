const {
    BrowserView,
    ipcMain,
    Menu,
    clipboard,
    BrowserWindow,
    dialog
} = require('electron')
const {Planet, FollowingPlanet} = require('../models')
const moment = require('moment')

const bunyan = require('bunyan');
const log = bunyan.createLogger({name: "planetView"});
const {bus} = require('../utils/events');


class PlanetSidebarController {
    createView() {
        this.view = new BrowserView({
            webPreferences: {
                webSecurity: false,
                preload: require('path').join(__dirname, '..', '..', 'preload.js')
            }
        })
        // this.view.webContents.openDevTools()
        this.menu = Menu.buildFromTemplate([
            {
                label: 'Create Planet',
                click: this.showCreatePlanetDialog.bind(this)
            }, {
                type: 'separator'
            }, {
                label: 'Follow Planet',
                click: this.showFollowPlanetDialog.bind(this)
            },
        ])
        ipcMain.on('createFollowMenu', (event) => {
            const win = BrowserWindow.fromWebContents(event.sender)
            this.menu.popup(win)
        })
        ipcMain.on('closeCreateDialog', (event) => {
            const win = BrowserWindow.fromWebContents(event.sender)
            win.close()
        })

        FollowingPlanet.followingMenu = Menu.buildFromTemplate([
            {
                label: 'Check for update',
                click: this.followPlanetUpdate.bind(this)
            },
            {
                label: 'Copy URL',
                click: () => {
                    clipboard.writeText(this.planetCtxMenuTargetPlanet.link)
                }
            },
            {
                label: 'Mark All as Read',
                click: () => {
                    const planet = FollowingPlanet.following.filter(p => p.id === this.planetCtxMenuTargetPlanet.id)[0]
                    planet.articles.forEach(a => {
                        if (a.read === false) {
                            a.read = true
                            a.save()
                        }
                    })
                    bus.emit('allreadchange', null, planet.id)
                    this.updateSidebarFollowing()
                }
            },
            {
                type: 'separator'
            }, {
                label: 'Unfollow',
                click: this.UnfollowPlanet.bind(this)
            },
        ])

        this.planetMenu = Menu.buildFromTemplate([
            {
                label: 'Copy IPNS',
                click: () => {
                    clipboard.writeText(this.planetCtxMenuTargetPlanet.ipns)
                }
            }, {
                label: 'Publish',
                click: this.publishPlanet.bind(this)
            }, {
                type: 'separator'
            }, {
                label: 'Delete',
                click: this.DeletePlanet.bind(this)
            },
        ])

        ipcMain.on('followingCtxMenu', (event, p) => {
            const win = BrowserWindow.fromWebContents(event.sender)
            FollowingPlanet.followingMenu.popup(win)
            this.planetCtxMenuTargetPlanet = p
        })

        ipcMain.on('planetCtxMenu', (event, p) => {
            const win = BrowserWindow.fromWebContents(event.sender)
            this.planetMenu.popup(win)
            this.planetCtxMenuTargetPlanet = p
        })

        ipcMain.on('createPlanet', (event, p) => {
            const win = BrowserWindow.fromWebContents(event.sender)
            win.close()
            this.createPlanet(p)
        })
        ipcMain.on('followPlanet', async (event, p) => {
            const win = BrowserWindow.fromWebContents(event.sender)
            const progressFunc = (msg) => {
                win.webContents.executeJavaScript(`(()=>{
                    document.querySelector('.msg').innerText = '${msg}';
                })()`)
            }
            try {
                await this.followPlanet(p, progressFunc)
                win.close()
            } catch (ex) {
                progressFunc(ex.toString())
            }
        })
        ipcMain.on('setfocus', async (event, p) => {
            let articles,
                title,
                planet = null
            if (p == 'today') {
                articles = this.filterArticles((a) => moment(a.created).isSame(moment(), 'day'))
                title = 'Today'
            } else if (p == 'unread') {
                articles = this.filterArticles((a) => a.read === false)
                title = 'Unread'
            } else if (p == 'starred') {
                articles = this.filterArticles((a) => a.starred === true)
                title = 'Starred'
            } else if (p.startsWith('my:')) {
                articles = this.filterArticles((a) => a.planet.id === p.substring('my:'.length))
                planet = Planet.planets.filter(a => a.id === p.substring('my:'.length))[0]
            } else if (p.startsWith('following:')) {
                articles = this.filterArticles((a) => a.planet.id === p.substring('following:'.length))
                planet = FollowingPlanet.following.filter(a => a.id === p.substring('following:'.length))[0]
            } else {
                log.error('unknow focus')
            }
            this.focusPlanet = planet
            bus.emit('focusPlanet', null, planet ? planet.json() : null)
            if (articles && articles.length > 0) {
                if (! title) {
                    title = articles[0].planet.name
                }
                bus.emit('focusInfo', null, {
                    focus: p,
                    title,
                    articles: articles.map(a => ({
                        ...a.json(),
                        url: a.url,
                        planet: a.planet.json()
                    }))
                })
            }
        })
        bus.on('planets-change', (id) => {
            this.updateSidebarMyPlanets()
        })
        bus.on('following-change', (id) => {
            this.updateSidebarFollowing()
        })
        bus.on('model/article/added', (a) => {
            const planet = Planet.planets.filter(p => p.id === a.planet.id)[0]
            if (planet) {
                bus.emit('focusInfo', null, {
                    title: planet.name,
                    focus: a.id,
                    articles: planet.articles.map(a => ({
                        ...a.json(),
                        url: a.url,
                        planet: planet.json()
                    }))
                })
            }
        })
        bus.on('article/read/change', () => {
            this.updateSidebarFollowing()
        })
        bus.on('article/star/change', () => {
            this.updateSidebarFollowing()
        })
        bus.on('ipfsOnlineState', (data) => { // log.info('ipfs online status change', data)
            this.ipfsOnlineState = data
            this.view.webContents.send('ipfsOnlineState', data)
        })
        this.view.webContents.on('did-finish-load', () => {
            if (this.ipfsOnlineState) {
                this.view.webContents.send('ipfsOnlineState', this.ipfsOnlineState)
            }
            this.updateSidebarMyPlanets()
            this.updateSidebarFollowing()
            if (!this.focusPlanet && Planet.planets.length > 0) {
                this.focusPlanet = Planet.planets[0]
                this.view.webContents.send('ipfsOnlineState', {
                        focus: `my:${
                        this.focusPlanet.id
                    }`
                })
                bus.emit('focusPlanet', null, this.focusPlanet.json())
                if (this.focusPlanet.articles.length > 0) {
                    bus.emit('focusInfo', null, {
                        title: this.focusPlanet.name,
                        focus: this.focusPlanet.articles[0].id,
                        articles: this.focusPlanet.articles.map(a => ({
                            ...a.json(),
                            url: a.url,
                            planet: this.focusPlanet.json()
                        }))
                    })
                }
            }
        })
    }
    async publishPlanet() {
        const planet = Planet.planets.filter(p => p.id === this.planetCtxMenuTargetPlanet.id)[0]
        await planet.publish()
    }
    async DeletePlanet() {
        const idx = dialog.showMessageBoxSync({
                message: `Are you sure you want to delete ${
                this.planetCtxMenuTargetPlanet.name
            }, this could not be undone ?`,
            buttons: ['Cancel', 'Delete']
        })
        if (idx) {
            const planet = Planet.planets.filter(p => p.id === this.planetCtxMenuTargetPlanet.id)
            Planet.planets = Planet.planets.filter(p => p.id !== this.planetCtxMenuTargetPlanet.id)
            if (planet.length > 0) {
                await planet[0].delete()
            }
            this.updateSidebarMyPlanets()
        }
    }
    async followPlanetUpdate() {
        const planet = FollowingPlanet.following.filter(p => p.id === this.planetCtxMenuTargetPlanet.id)[0]
        if (planet) {
            planet.update()
        }
    }
    async UnfollowPlanet() {
        const idx = dialog.showMessageBoxSync({
                message: `Are you sure you want to unfollow ${
                this.planetCtxMenuTargetPlanet.name
            } ?`,
            buttons: ['Cancel', 'Unfollow']
        })
        if (idx) {
            const planet = FollowingPlanet.following.filter(p => p.id === this.planetCtxMenuTargetPlanet.id)
            FollowingPlanet.following = FollowingPlanet.following.filter(p => p.id !== this.planetCtxMenuTargetPlanet.id)
            if (planet.length > 0) {
                await planet[0].delete()
            }
            this.updateSidebarFollowing()
        }
    }
    filterArticles(cb) { // TODO 优化性能 maybe
        let knownPlanets = {}
        let result = []
        for (let p of[
            ...Planet.planets,
            ...FollowingPlanet.following
        ]) {
            if (! knownPlanets[p.id]) {
                result = [
                    ... result,
                    ... p.articles.filter(cb)
                ]
                knownPlanets[p.id] = true
            }
        }
        return result
    }
    showFollowPlanetDialog() {
        const win = BrowserWindow.fromWebContents(this.view.webContents)
        const createPlanetDialog = new BrowserWindow({
            parent: win,
            x: win.getPosition()[0] + win.getSize()[0] / 2 - 300,
            y: win.getPosition()[1] + win.getSize()[1] / 2 - 200,
            width: 600,
            height: 400,
            frame: false,
            resizable: false,
            vibrancy: 'content',
            visualEffectState: 'followWindow',
            webPreferences: {
                preload: require('path').join(__dirname, '..', '..', 'preload.js')
            }
        })
        // createPlanetDialog.webContents.openDevTools({ mode: 'undocked' })
        createPlanetDialog.loadURL(`${
            require('../utils/websrv').WebRoot
        }/dialog/planet/follow`)
        createPlanetDialog.show()
    }
    showCreatePlanetDialog() {
        const win = BrowserWindow.fromWebContents(this.view.webContents)
        const createPlanetDialog = new BrowserWindow({
            parent: win,
            x: win.getPosition()[0] + win.getSize()[0] / 2 - 300,
            y: win.getPosition()[1] + win.getSize()[1] / 2 - 200,
            width: 600,
            height: 400,
            frame: false,
            resizable: false,
            webPreferences: {
                preload: require('path').join(__dirname, '..', '..', 'preload.js')
            }
        })
        // createPlanetDialog.webContents.openDevTools({ mode: 'undocked' })
        createPlanetDialog.loadURL(`${
            require('../utils/websrv').WebRoot
        }/dialog/planet/create`)
        createPlanetDialog.show()
    }
    async followPlanet(param, progresscb) {
        const {follow} = param;
        this.cancelFollow = false
        const planet = await FollowingPlanet.follow(follow, progresscb)
        if (!this.cancelFollow) {
            FollowingPlanet.following.push(planet)
            this.updateSidebarFollowing()
        }
    }
    async createPlanet(param) {
        const planet = await Planet.create(param)
        planet.save()
        Planet.planets = [
            planet,
            ...Planet.planets
        ]
        this.updateSidebarMyPlanets()
    }
    getNumbers() {
        const ret = {}
        FollowingPlanet.following.forEach(p => {
            p.articles.forEach(a => {
                if (moment(a.created).isSame(moment(), 'day')) {
                    ret.today = (ret.today || 0) + 1
                }
                if (a.read === false) {
                    ret.read = (ret.read || 0) + 1
                }
                if ((a.starred === true)) {
                    ret.starred = (ret.starred || 0) + 1
                }
            })
            ret[`following:${
                    p.id
                }`] = p.articles.filter(a => a.read === false).length
        })
        return ret
    }
    updateSidebarFollowing() {
        const numbers = this.getNumbers()
        this.view.webContents.send('numbers', numbers)
        this.view.webContents.send('following', FollowingPlanet.following.map(p => ({
            ...p.json(),
            busy: p.updating,
            avatar: p.avatar ? `file://${
                p.avatarPath
            }` : null
        })))
    }
    updateSidebarMyPlanets() {
        this.view.webContents.send('myplanets', Planet.planets.map(p => ({
            ...p.json(),
            busy: p.publishing,
            avatar: p.avatar ? `file://${
                p.avatarPath
            }` : null

        })))
    }

    async init() { // Planets SideBar 通讯代理和数据管理
        this.view.webContents.loadURL(`${
            require('../utils/websrv').WebRoot
        }/root`)
        this.view.setAutoResize({height: true})
        // this.view.webContents.openDevTools()
    }
}
module.exports = new PlanetSidebarController()
