class ScbrfCore {
  async init(cfg) {
    await require("./setting").init(cfg);
    await require("./ipfs").init(cfg);
  }
  async shutdown() {
    await require("./setting").close();
    await require("./ipfs").shutdown();
  }
}

Object.keys(require("./cmds")).forEach((cmd) => {
  ScbrfCore.prototype[cmd] = require("./cmds")[cmd];
});

module.exports = new ScbrfCore();
