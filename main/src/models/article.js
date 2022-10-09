const marked = require('marked')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const log = require('../utils/log')('modelsArticle')

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
    this.author = param.author || require('../utils/wallet').wallet.address
    this.planet = planet
    this.drafts = []
    this.summary = param.summary || Article.extractSummary(this)

    this.articlePath = require('path').join(planet.articlesPath, `${this.id}.json`)
    this.draftsPath = require('path').join(planet.articlesPath, `Drafts`)
    this.publicBase = require('path').join(planet.publicBasePath, this.id)
    this.publicArticlePath = require('path').join(this.publicBase, 'article.json')
    this.publicCommentsPath = require('path').join(this.publicBase, 'comments.js')
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

  static extractSummary(article) {
    if (article.content.length > 0) {
      const html = marked.parse(article.content)
      const dom = new JSDOM(html)
      return dom.window.document.body.textContent.substring(0, 300)
    } else {
      return 'Empty Content'
    }
  }

  json() {
    return {
      attachments: this.attachments,
      content: this.content,
      summary: this.summary,
      title: this.title,
      created: this.created,
      author: this.author,
      id: this.id,
      link: this.link,
      audioFilename: this.audioFilename,
      videoFilename: this.videoFilename,
    }
  }

  save() {
    require('fs').writeFileSync(this.articlePath, JSON.stringify(this.json()))
  }

  //从评论中心获取评论然后保存在本地的Public目录
  //不应该抛出异常。
  async publishComments() {
    log.debug('need publish comments for article:', { articleid: this.id, commentsipns: this.planet.commentsBridge })
    if (!this.planet.commentsBridge) return
    const url = `${require('../utils/ipfs').gateway}/ipns/${this.planet.commentsBridge}/${this.id.toUpperCase()}.json`
    log.debug('fetch  article comments from ', url)
    try {
      const comments = await require('axios').get(`${url}?seed=${new Date().getTime()}`)
      require('fs').writeFileSync(
        this.publicCommentsPath,
        `window.__INIT_COMMENTS__ = ${JSON.stringify(comments.data)}`
      )
      log.debug('fetch article comments done!')
    } catch (ex) {
      log.error('error when fetch comments', ex.message)
    }
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
