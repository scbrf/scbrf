class ScbrfCore {
  async init(cfg) {
    this.setting = require("./setting");
    this.setting.init(cfg);
    this.observe = require("mobx").observe;
    this.ipfs = require("./ipfs");
    this.planetStore = require("./model/PlanetStore");
    this.commands = require("./cmds");
    require("./Helper/TemplateStore").init();
    await this.ipfs.init(cfg);
  }
  async shutdown() {
    await this.setting.close();
    await this.ipfs.shutdown();
  }
}

// Object.keys(require("./cmds")).forEach((cmd) => {
//   ScbrfCore.prototype[cmd] = require("./cmds")[cmd];
// });

module.exports = new ScbrfCore();
