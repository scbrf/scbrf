const log = require("../log")("FollowingPlanetModel");
const PublicPlanetModel = require("./PublicPlanetModel");
const FollowingArticleModel = require("./FollowingArticleModel");
const PlanetType = require("./PlanetType");

class FollowingPlanetModel {
  id = "";
  name = "";
  about = "";
  created = null;
  planetType = null;
  link = "";
  cid = "";
  updated = null;
  lastRetrieved = null;
  archived = false;
  archivedAt = null;
  walletAddress = "";
  walletAddressResolvedAt = null;
  isUpdating = false;
  articles = [];
  avatar = null;
  juiceboxEnabled = false;
  juiceboxProjectID = 0;
  juiceboxProjectIDGoerli = 0;
  twitterUsername = "";
  githubUsername = "";
  telegramUsername = "";
  mastodonUsername = "";
  static followingPlanetsPath() {
    const url = require("path").join(
      require("../Helper/URLUtils").repoPath(),
      "Following"
    );
    if (!require("fs").existsSync(url)) {
      require("fs").mkdirSync(url);
    }
    return url;
  }
  get basePath() {
    return require("path").join(
      FollowingPlanetModel.followingPlanetsPath(),
      this.id
    );
  }
  get infoPath() {
    return require("path").join(this.basePath, "planet.json");
  }
  get articlesPath() {
    return require("path").join(this.basePath, "Articles");
  }
  get avatarPath() {
    return require("path").join(this.basePath, "avatar.png");
  }
  get nameInitials() {
    return this.name
      .split(" ")
      .filter((a) => a)
      .map((a) => `${a[0].toUpperCase()}${a.slice(1)}`)
      .join(" ");
  }
  get webviewURL() {
    return `${require("../ipfs").gateway}/ipfs/${this.cid}/`;
  }
  get browserURL() {
    if (this.planetType == PlanetType.ens) {
      return `https://${link}.limo`;
    }
    if (this.cid) {
      return `${require("../ipfs").preferredGateway()}/ipfs/${this.cid}/`;
    }
    return this.link;
  }
  get shareLink() {
    if (this.link.startsWith("https://")) return this.link;
    return `planet://${this.link}`;
  }
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      about: this.about,
      created: this.created,
      planetType: this.planetType,
      link: this.link,
      cid: this.cid,
      updated: this.updated,
      lastRetrieved: this.lastRetrieved,
      archived: this.archived,
      archivedAt: this.archivedAt,
      walletAddress: this.walletAddress,
      walletAddressResolvedAt: this.walletAddressResolvedAt,
      isUpdating: this.isUpdating,
      articles: this.articles,
      avatar: this.avatar,
      twitterUsername: this.twitterUsername,
      githubUsername: this.githubUsername,
      telegramUsername: this.telegramUsername,
      mastodonUsername: this.mastodonUsername,
      juiceboxEnabled: this.juiceboxEnabled,
      juiceboxProjectID: this.juiceboxProjectID,
      juiceboxProjectIDGoerli: this.juiceboxProjectIDGoerli,
    };
  }
  constructor(json) {
    Object.assign(this, json);
  }
  static async followENS(ens) {
    const resolver = await require("ethers")
      .getDefaultProvider()
      .getResolver(ens);
    if (!resolver) {
      throw require("./PlanetError").InvalidPlanetURLError;
    }
    const cid = await require("../ipfs").resolveIPNSorDNSLink(ens);
    if (!cid) {
      throw require("./PlanetError").ENSNoContentHashError;
    }
    log.info({ cid, ens }, "Follow ens got cid");
    require("../ipfs").pin(cid);

    const publicPlanet = await FollowingPlanetModel.getPublicPlanet(cid);
    log.info({ ens, name: publicPlanet.name }, "found native planet");
    let planet = new FollowingPlanetModel({
      id: require("uuid").v4().toUpperCase(),
      planetType: PlanetType.ens,
      name: publicPlanet.name,
      about: publicPlanet.about,
      link: ens,
      cid: cid,
      twitterUsername: publicPlanet.twitterUsername,
      githubUsername: publicPlanet.githubUsername,
      telegramUsername: publicPlanet.telegramUsername,
      mastodonUsername: publicPlanet.mastodonUsername,
      juiceboxEnabled: publicPlanet.juiceboxEnabled,
      juiceboxProjectID: publicPlanet.juiceboxProjectID,
      juiceboxProjectIDGoerli: publicPlanet.juiceboxProjectIDGoerli,
      created: publicPlanet.created,
      updated: publicPlanet.updated,
      lastRetrieved: new Date(),
    });
    require("fs").mkdirSync(planet.basePath);
    require("fs").mkdirSync(planet.articlesPath);
    planet.articles = publicPlanet.articles.map((a) =>
      FollowingArticleModel.from(a, planet)
    );
    planet.articles.sort((a, b) => b.created - a.created);
    let url = await resolver.getAvatar();
    if (!url) {
      url = `${require("../ipfs").gateway}/ipfs/${cid}/avatar.png`;
      log.info({ ens }, "try to found avatar in native planet");
    } else {
      log.info({ ens }, "found avatar from ENS");
    }
    const fs = require("fs");
    const { Readable } = require("stream");
    const { finished } = require("stream/promises");
    const fileStream = fs.createWriteStream(planet.avatarPath, {
      flags: "wx",
    });
    const res = await fetch(url);
    if (res.status == 200) {
      await finished(Readable.fromWeb(res.body).pipe(fileStream));
      planet.avatar = await require("jimp").read(planet.avatarPath);
    }

    const walletAddress = await resolver.getAddress();
    if (walletAddress) {
      planet.walletAddress = walletAddress;
      planet.walletAddressResolvedAt = new Date();
    }
    planet.save();
    planet.articles.forEach((a) => a.save());
    return planet;
  }
  static async getPublicPlanet(cid) {
    const planetURL = `${require("../ipfs").gateway}/ipfs/${cid}/planet.json`;
    const rsp = await fetch(planetURL);
    const json = await rsp.json();
    return new PublicPlanetModel(json);
  }
  static async followDotBit(link) {}
  static async followHTTP(link) {}
  static async followIPNSorDNSLink(link) {}
  static async follow(link) {
    link = link.trim();
    if (link.startsWith("planet://")) {
      link = link.substring("planet://".length);
    }
    const existing =
      require("../model/PlanetStore").state.followingPlanets.filter(
        (p) => p.link == link
      )[0];
    if (existing) {
      throw require("./PlanetError").PlanetExistsError;
    }
    if (link.endsWith(".eth")) {
      return await FollowingPlanetModel.followENS(link);
    }
    if (link.endsWith(".bit")) {
      return await FollowingPlanetModel.followDotBit(link);
    }
    if (
      link.toLowerCase().startsWith("http://") ||
      link.toLowerCase().startsWith("https://")
    ) {
      return await FollowingPlanetModel.followHTTP(link);
    }
    return await FollowingPlanetModel.followIPNSorDNSLink(link);
  }
  toJSON() {
    return {
      id: this.id,
      planetType: this.planetType,
      name: this.name,
      about: this.about,
      link: this.link,
      cid: this.cid,
      created: this.created,
      updated: this.updated,
      lastRetrieved: this.lastRetrieved,
      archived: this.archived,
      archivedAt: this.archivedAt,
      walletAddress: this.walletAddress,
      walletAddressResolvedAt: this.walletAddressResolvedAt,
      twitterUsername: this.twitterUsername,
      githubUsername: this.githubUsername,
      telegramUsername: this.telegramUsername,
      mastodonUsername: this.mastodonUsername,
      juiceboxEnabled: this.juiceboxEnabled,
      juiceboxProjectID: this.juiceboxProjectID,
      juiceboxProjectIDGoerli: this.juiceboxProjectIDGoerli,
    };
  }
  save() {
    require("fs").writeFileSync(this.infoPath, JSON.stringify(this));
  }
}

module.exports = FollowingPlanetModel;
