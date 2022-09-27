const evt = require('../utils/events')
const { Tray, app, Menu } = require('electron')
class TrayIcon {
  constructor() {
    evt.bindBusTable(this, [[evt.evAppInit, this.init]])
  }
  init() {
    if (process.platform !== 'win32') return
    const tray = new Tray(require('path').join(__dirname, '..', '..', 'resources', 'icon.png'))
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open',
        click: () => evt.emit(evt.evTrayOpen),
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        click: () => {
          app.quit()
        },
      },
    ])
    tray.setToolTip('Scarborough is running ...')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => evt.emit(evt.evTrayOpen))
  }
}
module.exports = new TrayIcon()
