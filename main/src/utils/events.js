const { ipcMain } = require('electron')
const eb = require('js-event-bus')()

function bindIpcMainTable(that, table) {
  for (let entry of table) {
    ipcMain.on(Object.keys(entry)[0], Object.values(entry)[0].bind(that))
  }
}

function bindBusTable(that, table) {
  for (let entry of table) {
    eb.on(entry[0], entry[1].bind(that))
  }
}

function emit(ev) {
  eb.emit(ev)
}

/**
 * 简化Model的声音，model只需要关注业务逻辑即可
 * @param {*} that 通常为某个类的 prototype
 * @param {*} model { name:{ default, emit } }
 */
function initDataModel(that, model) {
  var prototype = Object.getPrototypeOf(that)
  for (let name in model) {
    Object.defineProperty(prototype, name, {
      get() {
        //get 函数会直接返回一个内部private变量的值或者是默认的值
        return this[`#${name}`] || model[name].default
      },
      set(v) {
        //set 函数会设置这个内部private变量的值，如果定义了emit，则在值改变的时候emit一个事件
        this[`#${name}`] = v
        if (model[name].emit) {
          emit(model[name].emit, null, { src: 'set' })
        }
      },
    })
  }
  //同时会定义一个set原型函数，这个函数可以同时设置多个值
  //如果这些值对应相同的emit事件，则会被优化，避免事件多次emit
  prototype.set = function (obj) {
    const events = new Set()
    for (let key in obj) {
      if (key in model) {
        this[`#${key}`] = obj[key]
        if (model[key].emit) {
          events.add(model[key].emit)
        }
      }
    }
    for (let ev of Array.from(events)) {
      emit(ev, null, { src: 'set' })
    }
  }
}

module.exports = {
  bus: eb,
  bindIpcMainTable,
  bindBusTable,
  emit,
  initDataModel,
}
