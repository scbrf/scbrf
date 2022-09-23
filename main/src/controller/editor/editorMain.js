const {BrowserView, ipcMain, dialog, BrowserWindow} = require('electron')
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: "editor"});

class EditorTopbar {
    createView() {
        this.view = new BrowserView({
            webPreferences: {
                webSecurity: false,
                preload: require('path').join(__dirname, '..', '..', '..', 'preload.js')
            }
        })

        ipcMain.on('editor/publish', async (event) => {
            await this.draft.publish()
            const win = BrowserWindow.fromWebContents(event.sender)
            win.close()
        })

        ipcMain.on('draft', async (_, p) => {
            const draft = JSON.parse(p)
            this.draft.content = draft.content
            this.draft.title = draft.title
            this.draft.save()
        })

        ipcMain.on('attachPhoto', async () => {
            const pathes = dialog.showOpenDialogSync(BrowserWindow.fromBrowserView(this.view), {
                message: 'attach a photo',
                filters: [
                    {
                        name: 'Images',
                        extensions: ['jpeg', 'jpg', 'png', 'gif']
                    },
                ],
                properties: ['multiSelections', 'openFile']
            })
            if (pathes && pathes.length > 0) {
                for (let path of pathes) {
                    const basename = require('path').basename(path)
                    const filter = this.draft.attachments.filter(a => a.basename === basename)
                    if (filter.length === 0) {
                        require('fs').copyFileSync(path, require('path').join(this.draft.attachmentsPath, basename))
                        this.draft.attachments.push({
                            size: require('image-size')(path),
                            created: new Date().getTime(),
                            name: basename,
                            type: 'image',
                            url: 'file://' + require('path').join(this.draft.attachmentsPath, basename)
                        })
                    }
                }
                this.draft.save()
                this.view.webContents.send('updateAttachments', this.draft.attachments)
            }
        })

        ipcMain.on('attachAudio', async () => {
            const path = dialog.showOpenDialogSync(BrowserWindow.fromBrowserView(this.view), {
                message: 'attach a audio',
                filters: [
                    {
                        name: 'Music',
                        extensions: ['mp3', 'wav', 'm4a']
                    },
                ]
            })
            if (path && path.length > 0) {
                const basename = require('path').basename(path[0])
                this.draft.audioFilename = basename
                require('fs').copyFile(path[0], require('path').join(this.draft.attachmentsPath, basename), () => {})
                this.view.webContents.send('updateAudio', 'file://' + path[0])
                this.draft.save()
            }
        })

        ipcMain.on('attachFilm', async () => {
            const path = dialog.showOpenDialogSync(BrowserWindow.fromBrowserView(this.view), {
                message: 'attach a video',
                filters: [
                    {
                        name: 'Movies',
                        extensions: ['mkv', 'avi', 'mp4']
                    },
                ]
            })
            if (path && path.length > 0) {
                const basename = require('path').basename(path[0])
                this.draft.videoFilename = basename
                require('fs').copyFile(path[0], require('path').join(this.draft.attachmentsPath, basename), () => {})
                this.view.webContents.send('updateVideo', 'file://' + path[0])
                this.draft.save()
            }
        })
        // this.view.webContents.openDevTools()
    }
    init(draft) {
        this.view.setBounds({x: 0, y: 48, width: 600, height: 552})
        this.view.webContents.loadURL(`${
            require('../utils/websrv').WebRoot
        }/editor/main`)
        this.view.setAutoResize({width: true, height: true})
        this.draft = draft
        this.view.webContents.on('did-finish-load', () => {
            this.view.webContents.send('editor/update', this.draft.json())
        })
    }
}

module.exports = new EditorTopbar()
