const PlanetError = require("../model/PlanetError");
const log = require("../log")("FeedUtils");
class AvailableFeed {
  url = "";
  mime = "";
  constructor(url, mime) {
    this.url = url;
    this.mime = mime;
  }
}
class FeedUtils {
  selectBestFeed(feeds) {
    for (let feed of feeds) {
      if (feed.mime.indexOf("json") >= 0) {
        return feed;
      }
    }
    return feeds[0];
  }
  isFeed(mime) {
    return (
      mime.indexOf("application/xml") >= 0 ||
      mime.indexOf("text/xml") >= 0 ||
      mime.indexOf("application/atom+xml") >= 0 ||
      mime.indexOf("application/rss+xml") >= 0 ||
      mime.indexOf("application/json") >= 0 ||
      mime.indexOf("application/feed+json") >= 0
    );
  }
  async findFeed(url) {
    const response = await fetch(url);
    if (response.status != 200) {
      return [null, null];
    }
    log.debug({ url, headers: response.headers }, "findFeed");
    const mime = response.headers["content-type"].toLowerCase();
    if (this.isFeed(mime)) {
      return [response.body, null];
    }
    if (mime.indexOf("text/html") >= 0) {
      const jsdom = require("jsdom");
      const { JSDOM } = jsdom;
      const { window } = new JSDOM(await response.text());
      const availableFeeds = [
        ...window.document.querySelectorAll("link[rel=alternate]"),
      ].map((elem) => {
        const mime = elem.type;
        const href = elem.href;
        if (this.isFeed(mime)) {
          const availableFeedURLString = new URL(href, url).toString();
          return new AvailableFeed(availableFeedURLString, mime);
        }
      });
      log.debug({ availableFeeds }, "FeedUtils: availableFeeds");
      if (!availableFeeds.length) {
        return [null, window];
      }
      const bestFeed = this.selectBestFeed(availableFeeds);
      if (!bestFeed) {
        return [null, window];
      }
      const response2 = await fetch(bestFeed.url);
      if (response2.status != 200) {
        throw PlanetError.NetworkError;
      }
      return [response2.body, null];
    }
    return [null, null];
  }
}

module.exports = new FeedUtils();
