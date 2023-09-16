const URLUtils = require("../Helper/URLUtils");

const UUID = require("uuid").v4;
class MyPlanetModel {
  constructor(params) {
    const {
      id,
      name,
      about,
      ipns,
      created,
      updated,
      lastPublished,
      templateName,
    } = params;
    this.id = id;
    this.name = name;
    this.about = about;
    this.ipns = ipns;
    this.created = created;
    this.updated = updated;
    this.lastPublished = lastPublished;
    this.templateName = templateName;
  }
  static myPlanetsPath() {
    const url = require("path").join(
      require("../Helper/URLUtils").repoPath(),
      "My"
    );
    if (require("fs").existsSync(url)) {
      require("fs").mkdirSync(url);
    }
    return url;
  }
  get basePath() {
    return require("path").join(MyPlanetModel.myPlanetsPath, this.id);
  }
  get infoPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath,
      this.id,
      "planet.json"
    );
  }
  get articlesPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath,
      this.id,
      "Articles"
    );
  }
  get avatarPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath,
      this.id,
      "avatar.png"
    );
  }
  get faviconPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath,
      this.id,
      "favicon.ico"
    );
  }
  get opsPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath,
      this.id,
      "ops.json"
    );
  }
  get podcastCoverArtPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath,
      this.id,
      "podcastCoverArt.png"
    );
  }
  get draftsPath() {
    return require("path").join(MyPlanetModel.myPlanetsPath, this.id, "Drafts");
  }
  get articleDraftsPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath,
      this.id,
      "Articles",
      "Drafts"
    );
  }
  static publicPlanetsPath() {
    const url = require("path").join(URLUtils.repoPath(), "Public");
    if (!require("fs").existsSync(url)) {
      require("fs").mkdirSync(url);
    }
    return url;
  }

  get publicBasePath() {
    return require("path").join(MyPlanetModel.publicPlanetsPath(), this.id);
  }

  get publicInfoPath() {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      "planet.json"
    );
  }

  get publicAvatarPath() {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      "avatar.png"
    );
  }

  get publicFaviconPath() {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      "favicon.ico"
    );
  }

  get publicPodcastCoverArtPath() {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      "podcastCoverArt.png"
    );
  }

  get publicIndexPath() {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      "index.html"
    );
  }

  publicIndexPagePath(page) {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      `page${page}.html`
    );
  }

  get publicArchivePath() {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      "archive.html"
    );
  }

  get publicTagsPath() {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      "tags.html"
    );
  }

  publicTagPath(tag) {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      `${tag}.html`
    );
  }

  get publicRSSPath() {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      "rss.xml"
    );
  }

  get publicPodcastPath() {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      "podcast.xml"
    );
  }

  get publicAssetsPath() {
    return require("path").join(
      MyPlanetModel.publicPlanetsPath(),
      this.id,
      "assets"
    );
  }

  get template() {
    return require("../Helper/TemplateStore").get(this.templateName);
  }

  static async create(params) {
    const { name, about, templateName } = params;
    const id = UUID();
    const ipns = await require("../ipfs").generateKey(id);
    const now = new Date();
    const planet = new MyPlanetModel({
      id,
      name,
      about,
      ipns,
      created: now,
      updated: now,
      lastPublished: null,
      templateName,
    });
    planet.avatar = null;
    planet.podcastCoverArt = null;
    planet.drafts = [];
    planet.articles = [];
    require("fs").mkdirSync(planet.basePath);
    require("fs").mkdirSync(planet.articlesPath);
    require("fs").mkdirSync(planet.draftsPath);
    require("fs").mkdirSync(planet.articleDraftsPath);
    require("fs").mkdirSync(planet.publicBasePath);
    planet.copyTemplateAssets();
  }

  copyTemplateAssets() {
    if (require("fs").existsSync(this.publicAssetsPath)) {
      require("fs").rmSync(this.publicAssetsPath, {
        recursive: true,
        force: true,
      });
    }
    require("fs").cpSync(this.template.assetsPath, this.publicAssetsPath, {
      recursive: true,
    });
  }
}

module.exports = MyPlanetModel;
