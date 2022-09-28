const marked = require('marked')
const log = require('../utils/log')('models/article')

const uuid = require('uuid').v4

class Article {
  constructor(planet, param) {
    this.id = param.id || uuid()
    this.title = param.title || ''
    this.content = param.content || ''
    this.audioFilename = param.audioFilename || null
    this.videoFilename = param.videoFilename || null
    this.attachments = param.attachments || []
    const now = new Date().getTime()
    this.created = param.created || now
    this.updated = param.updated || now
    this.summary = param.summary || null
    this.planet = planet
    this.drafts = []

    this.articlePath = require('path').join(planet.articlesPath, `${this.id}.json`)
    this.draftsPath = require('path').join(planet.articlesPath, `Drafts`)
    this.publicBase = require('path').join(planet.publicBasePath, this.id)
    this.publicArticlePath = require('path').join(this.publicBase, 'article.json')
    this.publicIndexPath = require('path').join(this.publicBase, 'index.html')
  }

  static async load(name, planet) {
    if (!name.endsWith('.json')) {
      return
    }
    const articlePath = require('path').join(planet.articlesPath, name)
    const json = JSON.parse(require('fs').readFileSync(articlePath).toString())
    const article = new Article(planet, json)
    // await article.loadDrafts()
    return article
  }

  get url() {
    return 'file://' + this.publicIndexPath
  }

  json() {
    return {
      attachments: this.attachments,
      content: this.content,
      summary: this.summary,
      title: this.title,
      created: this.created,
      id: this.id,
      link: this.link,
      audioFilename: this.audioFilename,
      videoFilename: this.videoFilename,
    }
  }

  save() {
    require('fs').writeFileSync(this.articlePath, JSON.stringify(this.json()))
  }

  delete() {
    require('fs').rmSync(this.articlePath)
    require('fs').rmSync(this.publicBase, {
      recursive: true,
      force: true,
    })
    this.planet.publish()
  }

  savePublic() {
    require('fs').writeFileSync(
      this.publicArticlePath,
      JSON.stringify({
        attachments: [
          ...(this.audioFilename ? [this.audioFilename] : []),
          ...(this.videoFilename ? [this.videoFilename] : []),
          ...this.attachments.map((a) => a.name),
        ],
        audioFilename: this.audioFilename,
        content: this.content,
        created: require('../utils/datetime').timeIntervalSinceReferenceDate(this.created),
        hasAudio: !!this.audioFilename,
        hasVideo: !!this.videoFilename,
        id: this.id,
        link: `/${this.id}/`,
        title: this.title,
      })
    )
  }

  publicRender() {
    const content_html = marked.parse(this.content)
    const template = 'blog.html'
    const html = require('../utils/render')
      .getEnv(this.planet)
      .render(template, {
        planet: this.planet,
        planet_ipns: this.planet.ipns,
        assets_prefix: '../',
        article: {
          ...this.json(),
          hasAudio: !!this.audioFilename,
          hasVideo: !!this.videoFilename,
        },
        article_title: this.title,
        page_title: this.title,
        content_html: content_html,
        build_timestamp: new Date().getTime(),
      })
    require('fs').writeFileSync(this.publicIndexPath, html)
  }

  static fromDraft(draft) {
    const article = new Article(draft.planet, draft)
    if (article.audioFilename) {
      article.audioFilename = require('path').basename(article.audioFilename)
    }
    if (article.videoFilename) {
      article.videoFilename = require('path').basename(article.videoFilename)
    }
    return article
  }

  removeDraft(draft) {
    this.drafts = this.drafts.filter((d) => d.id !== draft.id)
  }
}

module.exports = Article
