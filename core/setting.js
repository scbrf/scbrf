const log = require("./log")("setting");

class Setting {
  tmproot = "PlanetSettingsTempRootKey";
  documentRoot = "PlanetSettingsDocumentRootKey";
  settingsLibraryLocation = "PlanetSettingsLibraryLocationKey";
  myPlanetsOrderKey = "myPlanetsOrder";
  prefs = {};
  async init(cfg = {}) {
    this.prefs = { ...cfg };
    const prefPath = this.get(
      "prefPath",
      require("path").join(__dirname, "pref.json")
    );
    try {
      const json = require("fs").readFileSync(prefPath);
      if (json) {
        this.prefs = { ...JSON.parse(json.toString()), prefPath };
      }
    } catch (ex) {
      log.error(ex, "init prefs error");
    }
  }
  async set(key, value) {
    this.prefs[key] = value;
    await this.save();
  }
  async close() {
    await this.save();
  }
  async save() {
    const prefPath = this.get(
      "prefPath",
      require("path").join(__dirname, "pref.json")
    );
    require("fs").writeFileSync(prefPath, JSON.stringify(this.prefs));
  }
  get(key, def) {
    return typeof this.prefs[key] == "undefined" ? def : this.prefs[key];
  }
}

module.exports = new Setting();
