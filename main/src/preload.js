const { contextBridge, ipcRenderer } = require("electron");

let bus = {};
function emit(evt, ...params) {
  Object.values(bus[evt] || {}).forEach((cb) => cb(...params));
}

contextBridge.exposeInMainWorld("api", {
  on(evt, key, callback) {
    if (!bus[evt]) {
      bus[evt] = {};
      ipcRenderer.on(evt, (event, params) => {
        emit(evt, params);
      });
    }
    bus[evt][key] = callback;
  },
  off(evt, key) {
    if (bus[evt][key]) delete bus[evt][key];
  },
  async call(path, ...params) {
    console.log("call api with", path, ...params);
    return await ipcRenderer.invoke(path, ...params);
  },
});
