const NodeCast = require('nodecast-js')

class DLNA {
  constructor() {
    this.nodeCast = new NodeCast()
    this.nodeCast.start()
  }
}

module.exports = new DLNA()
