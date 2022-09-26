const { BrowserView, ipcMain, dialog, BrowserWindow } = require('electron')
const log = require('../../utils/log')('editor')
const evt = require('../../utils/events')
const rt = require('../../models/runtime')

class EditorTopbar {
  constructor() {
    evt.bindIpcMainTable(this, [
      [evt.ipcDraftPublish, this.publish],
      [evt.ipcDraftSave, this.save],
      [evt.ipcDraftAddPhoto, this.addPhoto],
      [evt.ipcDraftAddAudio, this.addAudio],
      [evt.ipcDraftAddVideo, this.addVideo],
      [evt.ipcRemoveAttachment, this.removeAttachment],
    ])

    evt.bindBusTable(this, [[evt.evRuntimeDraftChange, this.updateUI]])
  }

  async removeAttachment(_, { name }) {
    log.info('draft need remove attachment', name)
    await this.draft.removeAttachment(name)
  }

  async addVideo() {
    const path = dialog.showOpenDialogSync(BrowserWindow.fromBrowserView(this.view), {
      message: 'attach a video',
      filters: [
        {
          name: 'Movies',
          extensions: ['mkv', 'avi', 'mp4'],
        },
      ],
    })
    if (path && path.length > 0) {
      this.view.webContents.send('updateVideo', 'file://' + path[0])
      await rt.draft.attachVideo(path[0])
    }
  }

  async addAudio() {
    const path = dialog.showOpenDialogSync(BrowserWindow.fromBrowserView(this.view), {
      message: 'attach a audio',
      filters: [
        {
          name: 'Music',
          extensions: ['mp3', 'wav', 'm4a'],
        },
      ],
    })
    if (path && path.length > 0) {
      this.view.webContents.send('updateAudio', 'file://' + path[0])
      await rt.draft.attachAudio(path[0])
    }
  }

  async addPhoto() {
    const pathes = dialog.showOpenDialogSync(BrowserWindow.fromBrowserView(this.view), {
      message: 'attach a photo',
      filters: [
        {
          name: 'Images',
          extensions: ['jpeg', 'jpg', 'png', 'gif'],
        },
      ],
      properties: ['multiSelections', 'openFile'],
    })
    if (pathes && pathes.length > 0) {
      await rt.draft.addPhotos(pathes)
      rt.draft.save()
      evt.emit(evt.evRuntimeDraftChange)
    }
  }

  async publish(event) {
    await rt.draft.publish()
    const win = BrowserWindow.fromWebContents(event.sender)
    win.close()
  }

  async save() {
    const draft = JSON.parse(p)
    rt.draft.content = draft.content
    rt.draft.title = draft.title
    rt.draft.save()
  }

  createView() {
    this.view = new BrowserView({
      webPreferences: {
        webSecurity: false,
        preload: require('path').join(__dirname, '..', '..', '..', 'preload.js'),
      },
    })
    // this.view.webContents.openDevTools()
  }
  init() {
    this.view.setBounds({ x: 0, y: 48, width: 600, height: 552 })
    this.view.webContents.loadURL(`${require('../../utils/websrv').WebRoot}/editor/main`)
    this.view.setAutoResize({ width: true, height: true })
    this.view.webContents.on('did-finish-load', () => {
      this.updateUI()
    })
  }
  updateUI() {
    this.view.webContents.send('editor/update', rt.draft.json())
  }
}

module.exports = new EditorTopbar()
