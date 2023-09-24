const URLUtils = require("./URLUtils");
const S = require("../setting");
const { createHash } = require("node:crypto");
const { marked } = require("marked");
const Environment = require("../Helper/Environment");
const log = require("../log")("Template Store");
class Template {
  name = "";
  description = "";
  path = "";
  author = "";
  version = "";
  idealItemsPerPage = 10;
  generateIndexPagination = false;
  generateTagPages = false;
  generateArchive = false;
  buildNumber = 1;
  generateNFTMetadata = false;
  settings = {};

  get id() {
    return this.name;
  }

  get hasSettings() {
    return Object.keys(this.settings).length > 0;
  }

  get blogPath() {
    return require("path").join(this.path, "templates", "blog.html");
  }

  // simple.html holds the basic minimal HTML structure for a quick preview.
  // It is not required for a template to have this file
  // TODO: A more detailed documentation about the template structure
  get blogSimplePath() {
    return require("path").join(this.path, "templates", "simple.html");
  }

  // tags.html for tag cloud, not all templates have this file
  get tagsPath() {
    return require("path").join(this.path, "templates", "tags.html");
  }

  // archive.html for a list of all items
  get archivePath() {
    return require("path").join(this.path, "templates", "archive.html");
  }

  get indexPath() {
    return require("path").join(this.path, "templates", "index.html");
  }

  get assetsPath() {
    return require("path").join(this.path, "assets");
  }

  get styleCSSPath() {
    return require("path").join(this.path, "assets", "style.css");
  }

  get styleCSSHash() {
    return createHash("sha256")
      .update(require("fs").readFileSync(this.styleCSSPath))
      .digest("hex");
  }

  get hasGitRepo() {
    let gitPath = require("path").join(this.path, ".git");
    return require("fs").existsSync(gitPath);
  }

  get hasSimpleHTML() {
    return require("fs").existsSync(this.blogSimplePath);
  }

  get hasTagsHTML() {
    return require("fs").existsSync(this.tagsPath);
  }

  get hasArchiveHTML() {
    return require("fs").existsSync(this.archivePath);
  }
  constructor(json) {
    Object.assign(this, json);
  }
  prepareTemporaryAssetsForPreview() {
    const tmproot = S.get(S.tmproot, require("os").tmpdir());
    const templatePreviewDirectory = require("path").join(tmproot, this.name);
    if (!require("fs").existsSync(templatePreviewDirectory)) {
      require("fs").mkdirSync(templatePreviewDirectory);
    }
    const assetsPreviewPath = require("path").join(
      templatePreviewDirectory,
      "assets"
    );
    if (require("fs").existsSync(assetsPreviewPath)) {
      require("fs").rmSync(assetsPreviewPath, { recursive: true, force: true });
    }
    require("fs").cpSync(this.assetsPath, assetsPreviewPath, {
      recursive: true,
    });
  }
  static from(path) {
    log.info({ path }, "Loading template");
    const templateInfoPath = require("path").join(path, "template.json");
    if (!require("fs").existsSync(templateInfoPath)) {
      log.error({ path }, "Template directory has no template.json");
      return;
    }
    const template = new Template(require(templateInfoPath));
    template.path = path;

    if (!require("fs").existsSync(template.blogPath)) {
      log.error({ path }, "Template directory has no blog.html");
      return;
    }
    if (!require("fs").existsSync(template.assetsPath)) {
      log.error({ path }, "Template directory has no assets directory");
      return;
    }
    return template;
  }
  getNextPage(page, pages) {
    if (page < pages) {
      return `page${page + 1}.html`;
    }
    return null;
  }
  getPreviousPage(page, pages) {
    if (page > 1) {
      return `page${page - 1}.html`;
    }
    return null;
  }
  renderCustomCode(planet, context) {
    const output = {
      custom_code_head: "",
      custom_code_body_start: "",
      custom_code_body_end: "",
    };
    const customCodeHeadEnabled = planet.customCodeHeadEnabled;
    if (customCodeHeadEnabled) {
      customCodeHead = planet.customCodeHead;
      output.custom_code_head = new Environment().renderTemplate({
        string: customCodeHead,
        context,
      });
    }
    const customCodeBodyStartEnabled = planet.customCodeBodyStartEnabled;
    if (customCodeBodyStartEnabled) {
      customCodeBodyStart = planet.customCodeBodyStart;
      output.custom_code_body_start = new Environment().renderTemplate({
        string: customCodeBodyStart,
        context,
      });
    }
    const customCodeBodyEndEnabled = planet.customCodeBodyEndEnabled;
    if (customCodeBodyEndEnabled) {
      customCodeBodyEnd = planet.customCodeBodyEnd;
      output.custom_code_body_end = new Environment().renderTemplate({
        string: customCodeBodyEnd,
        context,
      });
    }
    return output;
  }
  renderIndex(context) {
    const { planet, articles } = context;
    const pageAboutHTML = marked.parse(planet.about);
    let contextForRendering = {
      assets_prefix: "./",
      page_title: planet.name,
      page_description: planet.about,
      page_description_html: pageAboutHTML,
      articles,
      build_timestamp: Math.round(new Date().getTime() / 1000),
      style_css_sha256: this.styleCSSHash,
      current_item_type: context.current_item_type || "index",
      current_page: context.page || 1,
      total_pages: context.pages || 1,
      next_page:
        this.getNextPage(context.page || 1, context.pages || 1) || null,
      previous_page:
        this.getPreviousPage(context.page || 1, context.pages || 1) || null,
      ...context,
    };
    contextForRendering = {
      ...contextForRendering,
      ...this.renderCustomCode(planet, contextForRendering),
    };
    const path = require("path").dirname(this.indexPath);
    const name = require("path").basename(this.indexPath);
    return new Environment(path).renderTemplate({
      name,
      context: contextForRendering,
    });
  }
  renderTags(context) {
    const { planet, articles } = context;
    const pageAboutHTML = marked.parse(planet.about);
    let contextForRendering = {
      assets_prefix: "./",
      page_title: `${planet.name} - Tags`,
      page_description: planet.about,
      page_description_html: pageAboutHTML,
      articles,
      build_timestamp: Math.round(new Date().getTime() / 1000),
      style_css_sha256: this.styleCSSHash,
      current_item_type: "tags",
      ...context,
    };
    contextForRendering = {
      ...contextForRendering,
      ...this.renderCustomCode(planet, contextForRendering),
    };
    const path = require("path").dirname(this.tagsPath);
    const name = require("path").basename(this.tagsPath);
    return new Environment(path).renderTemplate({
      name,
      context: contextForRendering,
    });
  }
  renderArchive(context) {
    const { planet, articles } = context;
    const pageAboutHTML = marked.parse(planet.about);
    let contextForRendering = {
      assets_prefix: "./",
      page_title: `${planet.name} - Tags`,
      page_description: planet.about,
      page_description_html: pageAboutHTML,
      articles,
      build_timestamp: Math.round(new Date().getTime() / 1000),
      style_css_sha256: this.styleCSSHash,
      current_item_type: "archive",
      ...context,
    };
    contextForRendering = {
      ...contextForRendering,
      ...this.renderCustomCode(planet, contextForRendering),
    };
    const path = require("path").dirname(this.archivePath);
    const name = require("path").basename(this.archivePath);
    return new Environment(path).renderTemplate({
      name,
      context: contextForRendering,
    });
  }
}

class TemplateStore {
  templates = [];
  init() {
    this.load();
  }
  get(templateID) {
    const t = this.templates.filter((t) => t.id == templateID)[0];
    if (!t) throw new Error(`Error: bad template name:${templateID}`);
    return t;
  }
  load() {
    const templatesPath = require("path").join(
      URLUtils.repoPath(),
      "Templates"
    );
    if (!require("fs").existsSync(templatesPath)) {
      require("fs").mkdirSync(templatesPath);
    }
    const templatesMapping = {};
    for (let dir of require("fs").readdirSync(templatesPath)) {
      const template = Template.from(require("path").join(templatesPath, dir));
      if (template) {
        templatesMapping[template.name] = template;
      }
    }

    for (let builtInTemplate of require("./PlanetSiteTemplates.js")
      .builtInTemplates) {
      let overwriteLocal = false;
      if (templatesMapping[builtInTemplate.name]) {
        if (
          templatesMapping[builtInTemplate.name].version !=
          existingTemplate.version
        ) {
          if (existingTemplate.hasGitRepo) {
            log.info(
              { name: existingTemplate.name },
              "Skip updating existing template because it has a git repo"
            );
          } else {
            log.info(
              {
                name: existingTemplate.name,
                from: existingTemplate.version,
                to: templatesMapping[builtInTemplate.name].version,
              },
              "Updating existing template for version change"
            );
            overwriteLocal = true;
          }
        }
        if (
          !overwriteLocal &&
          existingTemplate.buildNumber < builtInTemplate.buildNumber
        ) {
          if (existingTemplate.hasGitRepo) {
            log.info(
              { name: existingTemplate.name },
              "Skip updating existing template because it has a git repo"
            );
          } else {
            log.info(
              {
                name: existingTemplate.name,
                from: existingTemplate.buildNumber,
                to: templatesMapping[builtInTemplate.name].buildNumber,
              },
              "Updating existing template for buildNumber change"
            );
            overwriteLocal = true;
          }
        }
      } else {
        overwriteLocal = true;
      }
      if (overwriteLocal) {
        log.info(
          { name: builtInTemplate.name },
          "Overwriting local built-in template"
        );
        const source = builtInTemplate.base;
        const directoryName = source.split(require("path").sep).slice(-1)[0];
        const destination = require("path").join(templatesPath, directoryName);
        try {
          require("fs").rmSync(destination, { recursive: true, force: true });
        } catch {}
        require("fs").cpSync(source, destination, { recursive: true });
        const newTemplate = Template.from(destination);
        templatesMapping[newTemplate.name] = newTemplate;
      }
    }

    this.templates = Object.values(templatesMapping).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    for (let template of this.templates) {
      template.prepareTemporaryAssetsForPreview();
    }
  }
}

module.exports = new TemplateStore();
