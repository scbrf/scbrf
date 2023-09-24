class Setting {
  tmproot = "PlanetSettingsTempRootKey";
  documentRoot = "PlanetSettingsDocumentRootKey";
  settingsLibraryLocation = "PlanetSettingsLibraryLocationKey";
  myPlanetsOrderKey = "myPlanetsOrder";
  settingsPublicGatewayIndex = "PlanetSettingsPublicGatewayIndexKey";
  settingsAPIEnabled = "PlanetSettingsAPIEnabledKey";
  settingsAPIPort = "PlanetSettingsAPIPortKey";
  defaultLogLevel = "PlanetDefaultLogLevelKey";
  prefs = {};
  init(cfg = {}) {
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
    } catch (ex) {}
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
