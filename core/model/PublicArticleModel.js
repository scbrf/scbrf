const ArticleType = require("./ArticleType");

class PublicArticleModel {
  articleType = ArticleType.blog;
  id = require("uuid").v4().toUpperCase();
  link = "";
  slug = "";
  externalLink = "";
  title = "";
  content = "";
  created = null;
  hasVideo = false;
  videoFilename = null;
  hasAudio = null;
  audioFilename = null;
  audioDuration = null;
  audioByteLength = null;
  attachments = [];
  heroImage = null;
  cids = {};
  tags = {};
  constructor(json) {
    Object.assign(this, json);
  }
}

module.exports = PublicArticleModel;
