const { ipcRenderer, contextBridge } = require('electron')
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  recieve: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(args)),
})
let ethereum = {}
contextBridge.exposeInMainWorld('ethereum', {
  async on(msg, cb) {
    ethereum[msg] = cb
    if (msg === 'accountsChanged') {
      const address = await ipcRenderer.invoke('wallet/address')
      cb([address])
    }
  },
  async request(obj) {
    const { method, params } = obj
    const result = await ipcRenderer.invoke(`ipc/${method}`, params)
    console.log('request method', obj, 'got', result)
    return result
  },
})
