const { log } = require("console");
const S = require("../setting");
class ArticleType {
  static blog = new ArticleType();
}

class ArticleStarType {
  star = new ArticleStarType();
}

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

class MyArticleModel extends ArticleModel {
  articleType = ArticleType.blog;
  link = "";
  slug = "";
  heroImage = "";
  externalLin = "";
  summary = "";
  isIncludedInNavigation = false;
  navigationWeight = 1;
  cids = {};
  tags = {};
  planet = null;
  draft = null;
  get path() {
    return require("path").join(this.planet.articlesPath, `${this.id}.json`);
  }
  get publicBasePath() {
    return require("path").join(this.planet.publicBasePath, this.id);
  }
  get publicIndexPath() {
    return require("path").join(this.publicBasePath, "index.html");
  }
  get publicSimplePath() {
    return require("path").join(this.publicBasePath, "simple.html");
  }
  get publicMarkdownPath() {
    return require("path").join(this.publicBasePath, "article.md");
  }
  get publicCoverImagePath() {
    return require("path").join(this.publicBasePath, "_cover.png");
  }
  get publicInfoPath() {
    return require("path").join(this.publicBasePath, "article.json");
  }
  get publicNFTMetadataPath() {
    return require("path").join(this.publicBasePath, "nft.json");
  }
  get publicArticle() {
    return {
      articleType: this.articleType || ArticleType.blog,
      id: this.id,
      link: this.slug ? `/${this.slug}/` : `/${this.link}/`,
      slug: this.slug || "",
      externalLink: this.externalLink || "",
      title: this.title || "",
      content: this.content || "",
      created: this.created,
      hasVideo: this.hasVideo,
      videoFilename: this.videoFilename,
      hasAudio: this.hasAudio,
      audioFilename: this.audioFilename,
      audioDuration: this.getAudioDuration(this.audioFilename),
      audioByteLength: this.getAttachmentByteLength(this.audioFilename),
      attachments: this.attachments,
      heroImage: this.socialImageURL,
      cids: this.cids,
      tags: this.tags,
    };
  }
  get localGatewayURL() {
    return `${require("../ipfs").gateway}/ipns/${planet.ipns}/${this.id}/`;
  }
  get localPreviewURL() {
    apiEnabled = S.get(S.settingsAPIEnabled, false);
    if (apiEnabled) {
      const apiPort = S.get(S.settingsAPIPort, "9191");
      return `http://127.0.0.1:${apiPort}/v0/planets/my/${this.planet.id}/public/${this.id}/index.html`;
    }
    return this.localGatewayURL;
  }
  get browserURL() {
    let urlPath = `/${id}/`;
    if (this.slug) {
      urlPath = `/${this.slug}/`;
    }
    if (this.planet.domain) {
      if (this.planet.domain.endsWith(".eth")) {
        return `https://${this.planet.domain}.limo${urlPath}`;
      } else if (this.planet.domain.endsWith(".bit")) {
        return `https://${this.planet.domain}.cc${urlPath}`;
      } else if (require("../utils").hasCommonTLDSuffix(this.planet.domain)) {
        return `https://${this.planet.domain}${urlPath}`;
      }
    }
    return `${require("../ipfs").preferredGateway()}/ipns/${
      this.planet.ipns
    }${urlPath}`;
  }
  get socialImageURL() {
    const heroImage = this.getHeroImage();
    const baseURL = this.browserURL();
    if (heroImage && baseURL) {
      return require("path").join(`${baseURL}${heroImage}`);
    }
  }
  constructor(json) {
    super(json);
    Object.assign(this, json);
  }
  save() {
    require("fs").writeFileSync(this.path, this);
  }
  async savePublic() {
    const started = new Date();
    const template = this.planet.template;
    if (!template) {
      throw new Error("MissingTemplateError");
    }
    this.removeDSStore();
    this.saveMarkdown();
    // MARK: Cover Image
    const coverImageText = this.getCoverImageText();
    this.saveCoverImage(coverImageText, this.publicCoverImagePath, {
      width: 512,
      height: 512,
    });
    const attachments = this.attachments;
    let needsCoverImageCID = !!attachments.length || !!this.audioFilename;

    let coverImageCID = null;
    if (needsCoverImageCID) {
      coverImageCID = this.obtainCoverImageCID();
    }

    if (attachments.length) {
      if (this.planet.templateName == "Croptop") {
        // _cover.png CID is only needed by Croptop now
        const newAttachments = ["_cover.png"];
        this.attachments = newAttachments;
      }
    }

    const attachmentCIDs = this.cids || [];
    const needsToUpdateCIDs = (() => {
      const cids = this.cids;
      if (cids.length) {
        for (let attachment of this.attachments || []) {
          if (!cids[attachment]) {
            log.debug({ title: this.title }, "NEEDED because of missing");
            return true;
          }
          if (cids[attachment].startsWith("Qm")) {
            log.debug({ title: this.title }, "NEEDED because not CIDv0");
            return true;
          }
        }
        return false;
      }
      if (this.attachments.length) {
        log.debug({ title: this.title }, "NEEDED");
        return true;
      }
    })();
    if (needsToUpdateCIDs) {
      this.cids = this.getCIDs();
      this.save();
    } else {
      log.debug({ title: this.title }, "CID Update  NOT NEEDED");
    }

    const doneCIDUpdate = new Date();
    log.debug(
      {
        title: this.title,
        duration: started.getTime() - doneCIDUpdate.getTime(),
      },
      "CID Update duration"
    );

    // MARK: - Video
    if (this.hasVideoContent()) {
      this.saveVideoThumbnail();
    }
    const doneVideoThumbnail = new Date();
    log.debug(
      {
        title: this.title,
        duration: doneVideoThumbnail.getTime() - doneCIDUpdate.getTime(),
      },
      "Video thumbnail duration"
    );

    // MARK: - NFT
    if (Object.keys(attachmentCIDs).length && template.generateNFTMetadata) {
      const generateNFTMetadata = template.generateNFTMetadata;
      const firstKey = Object.keys(attachmentCIDs)[0];
      const firstValue = attachmentCIDs[firstKey];
      let imageCID = firstValue;
      if (this.hasVideoContent()) {
        const videoThumbnailURL = this.getAttachmentURL("_videoThumbnail.png");
        const videoThumbnailCID = await require("../ipfs").getFileCIDv0(
          videoThumbnailURL
        );
        imageCID = videoThumbnailCID;
      }
      let animationCID;
      const audioFilename = this.audioFilename;
      if (audioFilename && coverImageCID) {
        log.debug(
          {
            title: this.title,
            audioFilename,
            coverImageCID,
          },
          "Audio NFT"
        );
        imageCID = coverImageCID;
      }
      const audioCID = attachmentCIDs[audioFilename];
      if (audioFilename && audioCID) {
        log.debug(
          {
            title: this.title,
            audioFilename,
            audioCID,
          },
          "Audio NFT "
        );
        animationCID = audioCID;
      }
      const videoFilename = this.videoFilename;
      const videoCID = attachmentCIDs[videoFilename];
      if (videoFilename && videoCID) {
        animationCID = videoCID;
      }
      log.debug({ title: this.title, imageCID }, "NFT image CIDv0");
      const attributes = [];
      const titleAttribute = { trait_type: "title", value: this.title };
      attributes.push(titleAttribute);
      const titleSHA256Attribute = {
        trait_type: "title_sha256",
        value: require("../utils").sha256(this.title),
      };
      attributes.push(titleSHA256Attribute);
      if (this.content) {
        const contentSHA256Attribute = {
          trait_type: "content_sha256",
          value: require("../utils").sha256(this.content),
        };
        attributes.push(contentSHA256Attribute);
      }
      const createdAtAttribute = {
        trait_type: "created_at",
        value: `${Math.round(new Date().getTime() / 1000)}`,
      };
      attributes.push(createdAtAttribute);

      const nft = {
        name: this.title,
        description: this.summary || firstKey,
        image: `https://ipfs.io/ipfs/${imageCID}`,
        external_url: this.externalLink || self.browserURL || "",
        mimeType: this.getAttachmentMimeType(firstKey),
        animation_url: animationCID
          ? `https://ipfs.io/ipfs/${animationCID}`
          : null,
        attributes,
      };
      require("fs").writeFileSync(
        this.publicNFTMetadataPath,
        JSON.stringify(nft)
      );
      const nftMetadataCID = this.getNFTJSONCID();
      log.info({ nftMetadataCID }, "NFT metadata CID");
      const nftMetadataCIDPath = require("path").join(
        this.publicBasePath,
        "nft.json.cid.txt"
      );
      require("fs").writeFileSync(nftMetadataCIDPath, nftMetadataCID);
    } else {
      log.debug({ title: this.title }, "Not writing NFT metadata");
    }

    const doneNFTMetadata = new Date();
    log.debug(
      {
        title: this.title,
        duration: doneNFTMetadata.getTime() - doneVideoThumbnail.getTime(),
      },
      "NFT metadata duration"
    );

    // MARK: - Render Markdown
    const articleHTML = template.render(this);
    require("fs").writeFileSync(this.publicIndexPath, articleHTML);

    if (template.hasSimpleHTML) {
      const simpleHTML = template.render(this, true);
      require("fs").writeFileSync(this.publicSimplePath, simpleHTML);
    }

    const doneArticleHTML = new Date();
    log.debug(
      {
        title: this.title,
        duration: doneArticleHTML.getTime() - doneNFTMetadata.getTime(),
      },
      "Article HTML duration"
    );

    if (this.hasHeroImage() || this.hasVideoContent) {
      this.saveHeroGrid();
    }

    const doneHeroGrid = new Date();
    log.debug(
      {
        title: this.title,
        duration: doneHeroGrid.getTime() - doneArticleHTML.getTime(),
      },
      "Hero grid duration"
    );

    require("fs").writeFileSync(this.publicInfoPath, this.publicArticle);
    if (this.slug) {
      const publicSlugBasePath = require("path").join(
        this.planet.publicBasePath,
        this.slug
      );
      if (require("fs").existsSync(publicSlugBasePath)) {
        require("fs").rmSync(publicSlugBasePath, {
          recursive: true,
          force: true,
        });
      }
      require("fs").cpSync(this.publicBasePath, publicSlugBasePath, {
        recursive: true,
      });
    }

    const doneSlug = new Date();
    log.debug(
      {
        title: this.title,
        duration: doneSlug.getTime() - doneHeroGrid.getTime(),
      },
      "Slug duration"
    );
  }
  getAttachmentURL(name) {
    const path = require("path").join(this.publicBasePath, name);
    if (require("fs").existsSync(path)) return path;
    return null;
  }
  async getCIDs() {
    const cids = {};
    for (let attachment of this.attachments || []) {
      const attachmentURL = this.getAttachmentURL(attachment);
      const attachmentCID = await require("../ipfs").getFileCIDv0(
        attachmentURL
      );
      cids[attachment] = attachmentCID;
    }
    return cids;
  }
  static compose(json = {}) {
    const id = require("uuid").v4().toUpperCase();
    const article = new MyArticleModel({
      id,
      link: json.link || `/${id}/`,
      title: json.title,
      content: json.content,
      summary: json.summary,
      created: json.created,
      starType: ArticleStarType.star,
    });
    article.planet = json.planet;
    require("fs").mkdirSync(article.publicBasePath);
    return article;
  }
}

module.exports = MyArticleModel;
