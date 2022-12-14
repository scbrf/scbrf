const { BrowserView, dialog, BrowserWindow, Menu } = require('electron')
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
      [evt.ipcDraftAddOnlyFans, this.addOnlyfansTag],
      [evt.ipcDraftRemoveAttachment, this.removeAttachment],
      [evt.ipcDraftVideoContextMenu, this.showVideoCtxMenu],
    ])

    evt.bindBusTable(this, [[evt.evRuntimeDraftChange, this.updateUI]])
  }

  showVideoCtxMenu(e) {
    const win = BrowserWindow.fromWebContents(e.sender)
    this.videoCtxMenu.popup(win)
  }

  async removeAttachment(_, { name }) {
    log.info('draft need remove attachment', name)
    await rt.draft.removeAttachment(name)
    this.updateUI()
  }

  async addOnlyfansTag() {
    rt.draft.content = await this.view.webContents.executeJavaScript(`(()=>{
      const node = document.querySelector('textarea')
      node.value = node.value.substring(0, node.selectionStart)
          + '<fansonly media=180 />'
          + node.value.substring(node.selectionStart)
      return node.value
    })()`)
    rt.draft.save()
  }

  async addVideo(event, path) {
    if (!path) {
      path = dialog.showOpenDialogSync(BrowserWindow.fromWebContents(event.sender), {
        message: 'attach a video',
        filters: [
          {
            name: 'Movies',
            extensions: ['mkv', 'avi', 'mp4', 'm4v'],
          },
        ],
      })
    }
    if (path && path.length > 0) {
      this.view.webContents.send('updateVideo', 'file://' + path[0])
      await rt.draft.attachVideo(path[0])
    }
  }

  async addAudio(event, path) {
    if (!path) {
      path = dialog.showOpenDialogSync(BrowserWindow.fromWebContents(event.sender), {
        message: 'attach a audio',
        filters: [
          {
            name: 'Music',
            extensions: ['mp3', 'wav', 'm4a'],
          },
        ],
      })
    }
    if (path && path.length > 0) {
      this.view.webContents.send('updateAudio', 'file://' + path[0])
      await rt.draft.attachAudio(path[0])
    }
  }

  async addPhoto(event, pathes) {
    if (!pathes) {
      pathes = dialog.showOpenDialogSync(BrowserWindow.fromWebContents(event.sender), {
        message: 'attach a photo',
        filters: [
          {
            name: 'Images',
            extensions: ['jpeg', 'jpg', 'png', 'gif'],
          },
        ],
        properties: ['multiSelections', 'openFile'],
      })
    }
    if (pathes && pathes.length > 0) {
      await rt.draft.addPhotos(pathes)
      rt.draft.save()
      this.updateUI()
    }
  }

  async publish(event) {
    await rt.draft.publish()
    const win = BrowserWindow.fromWebContents(event.sender)
    win.close()
  }

  async save(_, p) {
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
    this.videoCtxMenu = Menu.buildFromTemplate([
      {
        label: 'Delete',
        click: async () => {
          await rt.draft.removeAttachment(rt.draft.videoFilename)
          this.updateUI()
        },
      },
    ])
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
    if (!this.view) return
    this.view.webContents.send('editor/update', rt.draft.json())
  }
}

module.exports = new EditorTopbar()
