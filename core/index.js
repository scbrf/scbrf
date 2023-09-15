const { observe } = require("mobx");
class ScbrfCore {
  constructor() {
    this.observe = observe;
    this.ipfs = require("./ipfs");
    this.setting = require("./setting");
  }
  async init(cfg) {
    await this.setting.init(cfg);
    await this.ipfs.init(cfg);
  }
  async shutdown() {
    await this.setting.close();
    await this.ipfs.shutdown();
  }
}

Object.keys(require("./cmds")).forEach((cmd) => {
  ScbrfCore.prototype[cmd] = require("./cmds")[cmd];
});

module.exports = new ScbrfCore();
