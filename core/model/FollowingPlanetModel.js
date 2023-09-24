const log = require("../log")("FollowingPlanetModel");
const PublicPlanetModel = require("./PublicPlanetModel");
class PlanetType {
  static planet = new PlanetType(0);
  static ens = new PlanetType(1);
  static dnslink = new PlanetType(2);
  static dns = new PlanetType(3);
  static dotbit = new PlanetType(4);
}
class FollowingPlanetModel {
  static async followENS(ens) {
    const resolver = await require("ethers")
      .getDefaultProvider()
      .getResolver(ens);
    if (!resolver) {
      throw require("./PlanetError").InvalidPlanetURLError;
    }
    const result = await resolver.getContentHash();
    if (!result) {
      throw require("./PlanetError").EthereumError;
    }
    log.info({ ens, result }, "Get contenthash");
    const contenthash = result;
    const cid = await require("../ENSUtils").getCID(contenthash);
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
    planet.articles = publicPlanet.articles.map(
      (a) => new FollowingArticleModel.from(a, { planet: planet })
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
      planet.walletAddress = "0x" + walletAddress;
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
    //TODO
  }
  save() {
    require("fs").writeFileSync(this.infoPath, JSON.stringify(this));
  }
}

module.exports = FollowingPlanetModel;
