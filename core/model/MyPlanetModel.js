const moment = require("moment");
const URLUtils = require("../Helper/URLUtils");
const { timeToReferenceDate } = require("../utils");
const log = require("../log")("my planet model");
const UUID = require("uuid").v4;
const BLOG = 0;
const Environment = require("../Helper/Environment");
const PublicPlanetModel = require("./PublicPlanetModel");

class MyPlanetModel {
  podcastLanguage = "en";
  tags = {};
  templateStringRSS = (() => {
    const rssURL = require("path").join(
      __dirname,
      "..",
      "resources",
      "Templates",
      "RSS.xml"
    );
    return require("fs").readFileSync(rssURL).toString();
  })();
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
    return require("path").join(MyPlanetModel.myPlanetsPath(), this.id);
  }
  get infoPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath(),
      this.id,
      "planet.json"
    );
  }
  get articlesPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath(),
      this.id,
      "Articles"
    );
  }
  get avatarPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath(),
      this.id,
      "avatar.png"
    );
  }
  get faviconPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath(),
      this.id,
      "favicon.ico"
    );
  }
  get opsPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath(),
      this.id,
      "ops.json"
    );
  }
  get podcastCoverArtPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath(),
      this.id,
      "podcastCoverArt.png"
    );
  }
  get draftsPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath(),
      this.id,
      "Drafts"
    );
  }
  get articleDraftsPath() {
    return require("path").join(
      MyPlanetModel.myPlanetsPath(),
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

  hasAvatar() {
    return require("fs").existsSync(this.publicAvatarPath);
  }

  renderRSS(podcastOnly) {
    const templateStringRSS = this.templateStringRSS;
    if (!templateStringRSS) return;
    try {
      const allArticles = this.articles.map((i) => i.publicArticle);
      const publicArticles = allArticles.filter((item) =>
        podcastOnly ? item.audioFilename : true
      );
      const publicPlanet = new PublicPlanetModel({
        id: this.id,
        name: this.name,
        about: this.about,
        ipns: this.ipns,
        created: this.created,
        updated: this.updated,
        articles: publicArticles,
        plausibleEnabled: this.plausibleEnabled,
        plausibleDomain: this.plausibleDomain,
        plausibleAPIServer: this.plausibleAPIServer,
        juiceboxEnabled: this.juiceboxEnabled,
        juiceboxProjectID: this.juiceboxProjectID,
        juiceboxProjectIDGoerli: this.juiceboxProjectIDGoerli,
        twitterUsername: this.twitterUsername,
        githubUsername: this.githubUsername,
        telegramUsername: this.telegramUsername,
        mastodonUsername: this.mastodonUsername,
        podcastCategories: this.podcastCategories,
        podcastLanguage: this.podcastLanguage,
        podcastExplicit: this.podcastExplicit,
        tags: this.tags,
      });
      const environment = new Environment();
      let domain_prefix, root_prefix;
      if (this.domainWithGateway) {
        domain_prefix = `https://${this.domainWithGateway}`;
        root_prefix = `https://${this.domainWithGateway}`;
      } else {
        domain_prefix = require("../ipfs").preferredGateway();
        root_prefix = `${require("../ipfs").preferredGateway()}/ipfs/${
          this.ipns
        }`;
      }
      const hasDomain = this.domain && this.domain.indexOf(":") < 0;
      const context = {
        planet: publicPlanet,
        has_domain: hasDomain,
        domain: this.domainWithGateway || "",
        domain_prefix: domain_prefix,
        root_prefix: root_prefix,
        ipfs_gateway: require("../ipfs").preferredGateway(),
        podcast: podcastOnly,
        has_podcast_cover_art: require("fs").existsSync(
          this.publicPodcastCoverArtPath
        ),
      };
      const rssXML = environment.renderTemplate({
        string: templateStringRSS,
        context,
      });
      if (podcastOnly) {
        require("fs").writeFileSync(this.publicPodcastPath, rssXML);
      } else {
        require("fs").writeFileSync(this.publicRSSPath, rssXML);
      }
    } catch (ex) {
      log.error(ex, "Error render RSS");
    }
  }

  async savePublic() {
    if (!this.template) throw new Error("MissingTemplateError");
    this.removeDSStore();
    const siteNavigation = this.siteNavigation();
    const allArticles = this.articles.map((item) => item.publicArticle);
    const publicArticles = this.articles
      .filter((item) => item.articleType == BLOG)
      .map((item) => item.publicArticle);
    const publicPlanet = new PublicPlanetModel({
      id: this.id,
      name: this.name,
      about: this.about,
      ipns: this.ipns,
      created: this.created,
      updated: this.updated,
      articles: publicArticles,
      plausibleEnabled: this.plausibleEnabled,
      plausibleDomain: this.plausibleDomain,
      plausibleAPIServer: this.plausibleAPIServer,
      juiceboxEnabled: this.juiceboxEnabled,
      juiceboxProjectID: this.juiceboxProjectID,
      juiceboxProjectIDGoerli: this.juiceboxProjectIDGoerli,
      twitterUsername: this.twitterUsername,
      githubUsername: this.githubUsername,
      telegramUsername: this.telegramUsername,
      mastodonUsername: this.mastodonUsername,
      podcastCategories: this.podcastCategories,
      podcastLanguage: this.podcastLanguage,
      podcastExplicit: this.podcastExplicit,
      tags: this.tags,
    });
    const hasPodcastCoverArt = require("fs").existsSync(
      this.publicPodcastCoverArtPath
    );
    // MARK: - Render index.html and pages
    const itemsPerPage = this.template.idealItemsPerPage || 10;
    const generateIndexPagination =
      this.template.generateIndexPagination || false;
    if (
      generateIndexPagination &&
      publicPlanet.articles.length > itemsPerPage
    ) {
      const pages = Math.ceil(publicPlanet.articles.length / itemsPerPage);
      for (let i = 1; i <= pages; i++) {
        const pageArticles = publicPlanet.articles.slice(
          (i - 1) * itemsPerPage,
          i * itemsPerPage
        );
        const pageContext = {
          planet: publicPlanet,
          my_planet: this,
          site_navigation: siteNavigation,
          has_avatar: this.hasAvatar,
          og_image_url: this.ogImageURLString,
          has_podcast: publicPlanet.hasAudioContent(),
          has_podcast_cover_art: hasPodcastCoverArt,
          page: i,
          pages: pages,
          articles: pageArticles,
        };
        const pageHTML = this.template.renderIndex(pageContext);
        const pagePath = this.publicIndexPagePath(i);
        require("fs").writeFileSync(pagePath, pageHTML);

        if (i == 1) {
          const indexHTML = this.template.renderIndex(pageContext);
          require("fs").writeFileSync(this.publicIndexPath, indexHTML);
        }
      }
    } else {
      const pageContext = {
        planet: publicPlanet,
        my_planet: this,
        site_navigation: siteNavigation,
        has_avatar: this.hasAvatar(),
        og_image_url: this.ogImageURLString,
        has_podcast: publicPlanet.hasAudioContent(),
        has_podcast_cover_art: hasPodcastCoverArt,
        articles: publicPlanet.articles,
      };
      const pageHTML = this.template.renderIndex(pageContext);
      const pagePath = this.publicIndexPagePath(1);
      require("fs").writeFileSync(pagePath, pageHTML);

      const indexHTML = this.template.renderIndex(pageContext);
      require("fs").writeFileSync(this.publicIndexPath, indexHTML);
    }

    // MARK: - Render tags
    const generateTagPages = this.template.generateTagPages;
    if (generateTagPages) {
      const tagArticles = {};
      for (let article of allArticles) {
        if (article.tags) {
          const articleTags = article.tags;
          for (let key in articleTags) {
            if (MyPlanetModel.isReservedTag(key)) {
              continue;
            }
          }
          if (!tagArticles[key]) {
            tagArticles[key] = [];
          }
          tagArticles[key].push(article);
        }
      }
      for (let key in tagArticles) {
        const value = tagArticles[key];
        const tagContext = {
          planet: publicPlanet,
          my_planet: this,
          site_navigation: siteNavigation,
          has_avatar: this.hasAvatar(),
          og_image_url: this.ogImageURLString,
          has_podcast: publicPlanet.hasAudioContent(),
          has_podcast_cover_art: hasPodcastCoverArt,
          tag_key: key,
          tag_value: this.tags[key] || key,
          current_item_type: "tags",
          articles: value,
          page_title: `${this.name} - ${this.tags[key] || key}`,
        };
        const tagHTML = this.template.renderIndex(tagContext);
        const tagPath = this.publicTagPath(key);
        require("fs").writeFileSync(tagPath, tagHTML);
      }
      if (this.template.hasTagsHTML) {
        const tagsContext = {
          planet: publicPlanet,
          my_planet: this,
          site_navigation: siteNavigation,
          has_avatar: this.hasAvatar(),
          og_image_url: this.ogImageURLString,
          has_podcast: publicPlanet.hasAudioContent(),
          has_podcast_cover_art: hasPodcastCoverArt,
          tags: tags,
          tag_articles: tagArticles,
        };
        const tagsHTML = this.template.renderTags(tagsContext);
        require("fs").writeFileSync(this.publicTagsPath, tagsHTML);
      }
    }

    // MARK: - Render arthive.html
    const generateArchive = this.template.generateArchive;
    if (generateArchive) {
      if (this.template.hasArchiveHTML) {
        const archive = {};
        const archiveSections = [];
        const dateFormatter = "MM/YYYY";
        for (let article of allArticles) {
          const monthYear = moment(article.created).format(dateFormatter);
          if (!archive[monthYear]) {
            archive[monthYear] = [];
            archiveSections.push(monthYear);
          }
          archive[monthYear].push(article);
        }
        const archiveContext = {
          planet: publicPlanet,
          my_planet: this,
          site_navigation: siteNavigation,
          has_avatar: this.hasAvatar(),
          og_image_url: this.ogImageURLString,
          has_podcast: publicPlanet.hasAudioContent(),
          has_podcast_cover_art: hasPodcastCoverArt,
          articles: allArticles,
          archive: archive,
          archive_sections: archiveSections,
        };
        const archiveHTML = this.template.renderArchive(archiveContext);
        require("fs").writeFileSync(this.publicArchivePath, archiveHTML);
      }
    }

    // MARK: - Render RSS and podcast RSS
    this.renderRSS(false);

    if (publicPlanet.hasAudioContent()) {
      this.renderRSS(true);
    }

    const info = JSON.stringify({
      ...publicPlanet,
      created: timeToReferenceDate(publicPlanet.created),
      updated: timeToReferenceDate(publicPlanet.updated),
    });
    require("fs").writeFileSync(this.publicInfoPath, info);
  }
  save() {
    const saveObj = [
      "id",
      "name",
      "about",
      "domain",
      "authorName",
      "created",
      "ipns",
      "updated",
      "templateName",
      "lastPublished",
      "lastPublishedCID",
      "isPublishing",
      "archived",
      "archivedAt",
      "plausibleEnabled",
      "plausibleDomain",
      "plausibleAPIKey",
      "plausibleAPIServer",
      "twitterUsername",
      "githubUsername",
      "telegramUsername",
      "mastodonUsername",
      "dWebServicesEnabled",
      "dWebServicesDomain",
      "dWebServicesAPIKey",

      "pinnableEnabled",
      "pinnableAPIEndpoint",
      "pinnablePinCID",

      "filebaseEnabled",
      "filebasePinName",
      "filebaseAPIToken",
      "filebaseRequestID",
      "filebasePinCID",

      "customCodeHeadEnabled",
      "customCodeHead",
      "customCodeBodyStartEnabled",
      "customCodeBodyStart",
      "customCodeBodyEndEnabled",
      "customCodeBodyEnd",
      "podcastCategories",
      "podcastLanguage",
      "podcastExplicit",
      "juiceboxEnabled",
      "juiceboxProjectID",
      "juiceboxProjectIDGoerli",
      "avatar",
      "podcastCoverArt",
      "drafts",
      "articles",

      "tags",
      "aggregation",
    ].reduce((r, k) => {
      r[k] = this[k];
      return r;
    }, {});
    saveObj.created = timeToReferenceDate(saveObj.created);
    saveObj.updated = timeToReferenceDate(saveObj.updated);
    require("fs").writeFileSync(this.infoPath, JSON.stringify(saveObj));
  }
  siteNavigation() {
    return this.articles
      .map((article) =>
        article.isIncludedInNavigation
          ? {
              id: article.id,
              title: article.title,
              slug: article.slug || article.id,
              externalLink: article.externalLink,
              weight: article.navigationWeight || 1,
            }
          : null
      )
      .filter((a) => a);
  }
  removeDSStore() {
    const dsStorePath = require("path").join(this.publicBasePath, ".DS_Store");
    if (require("fs").existsSync(dsStorePath)) {
      try {
        require("fs").rmSync(dsStorePath);
        log.info({ name: this.name }, "Removed .DS_Store from planet");
      } catch (err) {
        log.error({ err, name: this.name }, "Failed to remove .DS_Store file");
      }
    }
  }
  static async create(params) {
    const { name, about, templateName } = params;
    const id = UUID().toUpperCase();
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
    return planet;
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
