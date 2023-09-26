const ArticleStarType = require("./ArticleStarType");

class ArticleModel {
  id = "";
  title = "";
  content = "";
  created = null;
  starred = null;
  starType = ArticleStarType.star;
  videoFilename = "";
  audioFilename = "";
  attachments = [];
  get hasVideo() {
    return !!this.videoFilename;
  }
  get hasAudio() {
    return !!this.audioFilename;
  }
  constructor(json) {
    Object.assign(this, json);
  }
}

module.exports = ArticleModel;
