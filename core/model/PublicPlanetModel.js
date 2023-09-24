class PublicPlanetModel {
  id = "";
  name = "";
  about = "";
  ipns = "";
  created = new Date();
  updated = new Date();
  articles = [];

  plausibleEnabled = false;
  plausibleDomain = "";
  plausibleAPIServer = "";

  juiceboxEnabled = false;
  juiceboxProjectID = 0;
  juiceboxProjectIDGoerli = 0;

  twitterUsername = "";
  githubUsername = "";
  telegramUsername = "";
  mastodonUsername = "";

  podcastCategories = {};
  podcastLanguage = "";
  podcastExplicit = false;

  tags = {};

  hasAudioContent() {
    for (let article of this.articles) {
      if (article.audioFilename) return true;
    }
    return false;
  }

  hasVideoContent() {
    for (let article of this.articles) {
      if (article.videoFilename) return true;
    }
    return false;
  }

  constructor(json) {
    Object.assign(this, json);
  }
}

module.exports = PublicPlanetModel;
