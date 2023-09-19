const { timeToReferenceDate } = require("../utils");
const sharp = require("sharp");
class AttachmentType {
  static image = new AttachmentType();
  static video = new AttachmentType();
  static audio = new AttachmentType();
  static file = new AttachmentType();
  static supportedImageContentTypes = [
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/gif",
  ];
  static supportedAudioContentTypes = [
    "audio/aac",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
  ];
  static supportedVideoContentTypes = [
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/webm",
    "video/x-msvideo",
    "application/octet-stream",
  ];
  static from(path) {
    const mime = require("mime");
    const mime_type = mime.getType(path);
    return AttachmentType.fromContentType(mime_type);
  }
  static fromContentType(mime) {
    if (supportedImageContentTypes.indexOf(mime) >= 0)
      return AttachmentType.image;
    if (supportedAudioContentTypes.indexOf(mime) >= 0)
      return AttachmentType.audio;
    if (supportedVideoContentTypes.indexOf(mime) >= 0)
      return AttachmentType.video;
    return AttachmentType.file;
  }
}

class Attachment {
  name = "";
  type = "";
  created;
  get path() {
    return require("path").join(this.draft.attachmentsPath, this.name);
  }
  constructor(json) {
    object.assign(this, json);
    this.created = timeToReferenceDate(new Date());
  }
  async loadThumbnail() {
    if (this.type == AttachmentType.image) {
      this.thumbnail = await new sharp(this.path).resize(128);
    } else {
      this.thumbnail = new sharp(
        require("path").join(__dirname, "..", "resources", "attachment.png")
      );
    }
  }
}
class DraftModel {
  id = "";
  date = new Date();
  title = "";
  content = "";
  attachments = [];
  heroImage = "";
  externalLink = "";
  tags = [];
  target;
  initialContentSHA256 = "";
  get planetUUIDString() {
    return this.target.planet ? this.target.planet.id : this.target.id;
  }
  get basePath() {
    return require("path").join(
      this.target.planet
        ? this.target.planet.articleDraftsPath
        : this.target.draftsPath,
      this.id
    );
  }
  get infoPath() {
    return require("path").join(this.basePath, "Draft.json");
  }
  get attachmentsPath() {
    return require("path").join(this.basePath, "Attachments");
  }
  get previewPath() {
    return require("path").join(this.attachmentsPath, "preview.html");
  }
  contentRaw() {
    this.attachments.sort((a, b) => a.name.localeCompare(b.name));
    const tags = this.tags.map((t) => t.key).join(",");
    const attachmentNames = this.attachments.map((a) => a.name).join(",");
    const heroImageFilename = this.heroImage || "";
    const currentContent = `${this.date}${this.title}${this.content}${attachmentNames}${tags}${heroImageFilename}`;
    return currentContent;
  }
  contentSHA256() {
    return require("../utils").sha256(this.contentRaw);
  }
  constructor(json) {
    Object.assign(this, json);
  }
  toJSON() {
    return {
      id: this.id,
      date: timeToReferenceDate(this.date),
      title: this.title,
      content: this.content,
      attachments: this.attachments,
      heroImage: this.heroImage,
      tags: this.tags,
      externalLink: this.externalLink,
    };
  }
  save() {
    require("fs").writeFileSync(this.infoPath, JSON.stringify(this));
  }
  static async create({ planet, article }) {
    let draft;
    if (planet) {
      draft = new DraftModel({
        id: require("uuid").v4().toUpperCase(),
        title: "",
        content: "",
        attachments: [],
        target: planet,
      });
      require("fs").mkdirSync(draft.basePath);
      require("fs").mkdirSync(draft.attachmentsPath);
    } else if (article) {
      draft = new DraftModel({
        id: require("uuid").v4().toUpperCase(),
        date: article.created,
        title: article.title,
        content: article.content,
        attachments: [],
        heroImage: article.heroImage,
        externalLink: article.externalLink || "",
        target: article,
      });
      require("fs").mkdirSync(draft.basePath);
      require("fs").mkdirSync(draft.attachmentsPath);
      draft.attachments = await Promise.all(
        require("fs")
          .readdirSync(article.publicBasePath)
          .filter((name) => {
            return (
              [
                "index.html",
                "simple.html",
                "article.json",
                "nft.json",
                "nft.json.cid.txt",
                "_videoThumbnail.png",
                "_grid.jpg",
                "_grid.png",
                "_cover.png",
                "article.md",
              ].indexOf(name) < 0
            );
          })
          .map(async (name) => {
            const attachment = new Attachment({
              name,
              type: AttachmentType.from(name),
            });
            attachment.draft = draft;
            const filePath = require("path").join(article.publicBasePath, name);
            const attachmentPath = require("path").join(
              draft.attachmentsPath,
              name
            );
            if (require("fs").existsSync(attachmentPath)) {
              require("fs").rmSync(attachmentPath);
            }
            require("fs").cpSync(filePath, attachmentPath);
            await attachment.loadThumbnail();
            return attachment;
          })
      );
      draft.tags = article.tags || {};
    }
    draft.save();
    return draft;
  }
  hasAttachment(name) {
    return this.attachments.filter((a) => a.name == name)[0];
  }
}

module.exports = DraftModel;
