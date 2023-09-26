const { marked } = require("marked");
const ArticleModel = require("./ArticleModel");
const PlanetType = require("./PlanetType");
const ArticleStarType = require("./ArticleStarType");

class FollowingArticleModel extends ArticleModel {
  link = "";
  read = null;
  summary = "";
  planet = null;
  get path() {
    return require("path").join(this.planet.articlesPath, `${this.id}.json`);
  }
  get webviewURL() {
    switch (this.planet.planetType) {
      case PlanetType.planet:
      case PlanetType.dnslink:
      case PlanetType.ens:
      case PlanetType.dotbit:
        const cid = this.planet.cid;
        if (cid) {
          if (this.link.startsWith("https://ipfs.io/ipns/")) {
            return `${require("../ipfs").gateway}${this.link.substring(
              "https://ipfs.io/ipns/".length
            )}`;
          }
          if (FollowingArticleModel.linkStartsWithInternalGateway()) {
            return `${require("../ipfs").gateway}${this.link.substring(22)}`;
          }
          if (this.isHTTP(this.link)) {
            return `${
              require("../ipfs").gateway
            }/ipfs/${cid}${this.pathQueryFragment(this.link)}`;
          }
          if (
            this.link.startsWith("/ipfs/Q") ||
            this.link.startsWith("/ipfs/b")
          ) {
            return `${require("../ipfs").gateway}${this.link}`;
          }
          if (this.link.startsWith("/")) {
            return `${require("../ipfs").gateway}/ipfs/${cid}${this.link}`;
          }
          return new URL(
            this.link,
            `${require("../ipfs").gateway}/ipfs/${cid}/`
          ).toString();
        }
      case PlanetType.dns:
        if (this.link.startsWith("https://ipfs.io/ipns/")) {
          return `${require("../ipfs").gateway}${this.link.substring(15)}`;
        }
        return new URL(this.link, planet.link).toString();
    }
  }
  get browserURL() {
    switch (this.planet.planetType) {
      case PlanetType.planet:
        return `${require("../ipfs").gateway}/ipns/${this.planet.link}${
          this.link
        }`;
      case PlanetType.ens:
        if (this.isHTTP(this.link)) {
          return `https://${this.planet.link}.limo${this.pathQueryFragment(
            this.link
          )}`;
        }
        return new URL(
          this.link,
          `https://${this.planet.link}.limo`
        ).toString();
      case PlanetType.dotbit:
        if (this.isHTTP(this.link)) {
          return `https://${this.planet.link}.cc${this.pathQueryFragment(
            this.link
          )}`;
        }
        return new URL(this.link, `https://${this.planet.link}.cc`).toString();
      case PlanetType.dnslink:
        if (
          this.planet.link.length == 62 &&
          this.planet.link.startsWith("k51") &&
          this.link.startsWith("/")
        ) {
          if (
            this.link.startsWith("/ipfs/Q") ||
            this.link.startsWith("/ipfs/b") ||
            this.link.startsWith("/ipns/")
          ) {
            return `${require("../ipfs").preferredGateway()}${this.link}`;
          }
          return `${require("../ipfs").preferredGateway()}/ipns/${planet.link}${
            this.link
          }`;
        }
        if (this.link.startsWith("/") && this.link.indexOf("://") < 0) {
          return `https://${this.planet.link}${this.link}`;
        }
        return this.link;
      case PlanetType.dns:
        return new URL(this.link, this.planet.link).toString();
    }
  }
  static extractSummary(content) {
    const { window } = new JSDOM(content);
    let summary = window.document.body.textContent;
    if (summary.length > 280) {
      return `${summary.slice(0, 280)}...`;
    }
    return summary;
  }
  static extractSummary(article, planet) {
    if (article.content) {
      if (
        planet.planetType == PlanetType.planet ||
        planet.planetType == PlanetType.ens ||
        planet.planetType == PlanetType.dotbit
      ) {
        return FollowingArticleModel.extractSummary(
          marked.parse(article.content)
        );
      } else if (
        planet.planetType == PlanetType.dnslink ||
        planet.planetType == PlanetType.dns
      ) {
        return FollowingArticleModel.extractSummary(article.content);
      }
    }
  }
  constructor(json) {
    super(json);
    Object.assign(this, json);
    this.summary = FollowingArticleModel.extractSummary(json.content);
  }
  static linkStartsWithInternalGateway(link) {
    return link.match(/^http:\/\/127\.0\.0\.1:181[0-9]{2}\//);
  }
  pathQueryFragment(link) {
    const mark1 = link.indexOf("#");
    const mark2 = link.indexOf("?");
    if (mark1 >= 0) {
      return link.substring(mark1);
    }
    if (mark2 >= 0) {
      return link.substring(mark2);
    }
    return "";
  }
  static from(publicArticle, planet) {
    let articleLink;
    if (
      FollowingArticleModel.linkStartsWithInternalGateway(publicArticle.link)
    ) {
      const path = publicArticle.link.substring(22);
      if (path.startsWith("/ipfs/Qm") && path.length > 6 + 46) {
        articleLink = path.substring(6 + 46);
      } else {
        articleLink = path;
      }
    } else {
      articleLink = publicArticle.link;
    }
    const article = new FollowingArticleModel({
      id: require("uuid").v4(),
      link: articleLink,
      title: publicArticle.title,
      content: publicArticle.content,
      created: publicArticle.created,
      read: null,
      starred: null,
      starType: ArticleStarType.star,
      videoFilename: publicArticle.videoFilename,
      audioFilename: publicArticle.audioFilename,
      attachments: publicArticle.attachments,
    });
    article.summary = FollowingArticleModel.extractSummary(article, planet);
    article.planet = planet;
    return article;
  }
  getAttachmentURL(name) {
    const base = this.webviewURL;
    if (base && base.endsWith("/")) {
      return require("path").join(base, name);
    }
  }
  toJSON() {
    return {
      id: this.id,
      link: this.link,
      title: this.title,
      content: this.content,
      summary: this.summary,
      created: this.created,
      read: this.read,
      starred: this.starred,
      starType: this.starType,
      videoFilename: this.videoFilename,
      audioFilename: this.audioFilename,
      attachments: this.attachments,
    };
  }
  save() {
    require("fs").writeFileSync(this.path, JSON.stringify(this));
  }
  delete() {
    require("fs").rmSync(this.path);
  }
}
module.exports = FollowingArticleModel;
