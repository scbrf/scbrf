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
    return S.get(S.documentRoot, this.root);
  }
  get defaultRepoPath() {
    const url = require("path").join(this.documentsPath, "Planet");
    if (!require("fs").existsSync(url)) {
      require("fs").mkdirSync(url);
    }
    return url;
  }
  repoPath() {
    const libraryLocation = S.get(
      S.settingsLibraryLocation,
      this.defaultRepoPath
    );
    return libraryLocation;
  }
}

module.exports = new URLUtils();
