const log = require("../log")("planet templates");

class BuiltInTemplate {
  name = "";
  description = "";
  author = "";
  version = "";
  buildNumber = 0;
  base = "";
  get id() {
    return this.name;
  }
  get blog() {
    return require("path").join(base, "templates", "blog.html");
  }
  get assets() {
    return require("path").join(base, "assets");
  }
  constructor(json) {
    Object.assign(this, json);
  }
  static from(base) {
    const json = require(require("path").join(base, "template.json"));
    const buildinTemplate = new BuiltInTemplate(json);
    buildinTemplate.base = base;
    return buildinTemplate;
  }
}

class PlanetSiteTemplates {
  builtInTemplates = [];
  constructor() {
    this.init();
  }
  init() {
    const root = require("path").join(__dirname, "..", "templates");
    log.info({ root }, "Loading built in templates");
    const dirs = require("fs").readdirSync(root);
    this.builtInTemplates = dirs
      .map((dir) => BuiltInTemplate.from(require("path").join(root, dir)))
      .filter((a) => a);
  }
}

module.exports = new PlanetSiteTemplates();
