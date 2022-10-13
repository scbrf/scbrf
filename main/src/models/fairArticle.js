const marked = require('marked')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const log = require('../utils/log')('modelFairArticle')
class FairArticle {
  static FairArticlesPath
  constructor(a) {
    this.id = a.id
    this.link = a.link
    this.title = a.title
    this.content = a.content
    this.created = require('../utils/datetime').timeFromReferenceDate(a.created)
    this.read = a.read || false
    this.starred = a.starred || false
    this.videoFilename = a.videoFilename
    this.audioFilename = a.audioFilename
    this.attachments = a.attachments
    this.value = a.value
    this.when = a.when
    this.duration = a.duration
    this.ipns = a.ipns
    this.summary = a.summary || FairArticle.extractSummary(this)
    this.planet = {
      ipns: a.ipns,
      json: () => ({ ipns: a.ipns }),
    }
  }

  static async load(uuid) {
    const articlePath = require('path').join(FairArticle.FairArticlesPath, `${uuid}.json`)
    if (require('fs').existsSync(articlePath)) {
      return new FairArticle(JSON.parse(require('fs').readFileSync(articlePath).toString()))
    }
  }
  get url() {
    return `http://127.0.0.1:${require('../utils/ipfs').gatewayPort}/ipns/${this.ipns}/${this.id}/`
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
      value: this.value,
      when: this.when,
      duration: this.duration,
    }
  }
  static async fetch(meta) {
    const url = `http://127.0.0.1:${require('../utils/ipfs').gatewayPort}/ipns/${meta.ipns}/${meta.uuid}/article.json`
    try {
      const rsp = await require('axios').get(url)
      const articlePath = require('path').join(FairArticle.FairArticlesPath, `${meta.uuid}.json`)
      require('fs').writeFileSync(
        articlePath,
        JSON.stringify({
          ...rsp.data,
          ...meta,
        })
      )
    } catch (ex) {
      log.error('error on fair fetch', { ...meta, error: ex.message })
    }
  }
}

module.exports = FairArticle
