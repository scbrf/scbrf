const S = require("../setting");
class URLUtils {
  get root() {
    const url = require("path").join(__dirname, "..", "data");
    if (!require("fs").existsSync(url)) {
      require("fs").mkdirSync(url);
    }
    return url;
  }
  get documentsPath() {
    const url = S.get(S.documentRoot, this.root);
    return url;
  }
  get defaultRepoPath() {
    const url = require("path").join(this.documentsPath, "Planet");
    if (!require("fs").existsSync(url)) {
      require("fs").mkdirSync(url);
    }
    return url;
  }
  static repoPath() {
    const libraryLocation = S.get(
      S.settingsLibraryLocation,
      this.defaultRepoPath
    );
    return libraryLocation;
  }
}

module.exports = new URLUtils();
