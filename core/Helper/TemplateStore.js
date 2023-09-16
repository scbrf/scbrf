const URLUtils = require("./URLUtils");

class Template {
  async prepareTemporaryAssetsForPreview() {}
  static from(path) {}
}

class TemplateStore {
  templates = [];
  async init() {
    await this.load();
  }
  get(templateID) {
    return this.templates.filter((t) => t.id == templateID)[0];
  }
  async load() {
    const templatesPath = require("path").join(
      URLUtils.constructor.repoPath(),
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

    for (let builtInTemplate of require("./PlanetSiteTemplates")
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
      a.name.localCompare(b.name)
    );
    for (let template of this.templates) {
      await template.prepareTemporaryAssetsForPreview();
    }
  }
}

module.exports = new TemplateStore();
