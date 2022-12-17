const marked = require('marked')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const ffmpeg = require('../utils/ffmpeg')
const ipfs = require('../utils/ipfs')
const wallet = require('../utils/wallet')
const EthCrypto = require('eth-crypto')
const log = require('../utils/log')('modelsArticle')

const uuid = require('uuid').v4

class Article {
  constructor(planet, param) {
    this.id = (param.id || uuid()).toUpperCase()
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
    this.fansDeliverPath = require('path').join(this.publicBase, 'fans.json')

    this.fansonlyBase = require('path').join(planet.fansOnlyBasePath, this.id)
    this.fansonlyAssetsPath = require('path').join(this.fansonlyBase, 'assets')
    this.fansonlyIndexPath = require('path').join(this.fansonlyBase, 'index.html')
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

  url(fansOnly) {
    if (fansOnly && this.hasFansOnlyContent()) {
      return 'file://' + this.fansonlyIndexPath
    }
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

  hasFansOnlyContent() {
    return this.content.search(/<fansonly/i) >= 0
  }

  attchmentIsFansOnly(attach) {
    if (!this.hasFansOnlyContent()) return false
    const pos = this.content.search(new RegExp(`<img[^>]*src="${attach.name}"`))
    if (pos < 0) return true
    const fansonlyPos = this.content.search(/<fansonly/i)
    return pos > fansonlyPos
  }

  mediaPreviewLen() {
    const result = this.content.match(/<fansonly[^>]*preview=([\d]*)/)
    return result ? parseInt(result[1]) : 0
  }

  buildPreviewMedia(mediaPath, previewPath, previewLen) {
    return ffmpeg.preview(mediaPath, previewPath, previewLen)
  }

  async encrypt(pubkey, cid) {
    log.debug('need do encrypt with pubkey', pubkey)
    const fromHexString = (hexString) => Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
    const encrypted = await EthCrypto.encryptWithPublicKey(fromHexString('04' + pubkey.substring(2)), cid)
    return EthCrypto.cipher.stringify(encrypted)
  }

  publickey2Addr(pubkey) {
    return require('ethers').utils.computeAddress('0x04' + pubkey.slice(2))
  }

  async deliverToFans() {
    const cid = await ipfs.addDirectory(this.fansonlyBase)
    const fans = await wallet.myfans(this.planet.ipns)
    const result = {}
    for (let fan of fans || []) {
      const addr = this.publickey2Addr(fan.pubkey)
      result[addr] = await this.encrypt(fan.pubkey, cid)
    }
    require('fs').writeFileSync(this.fansDeliverPath, JSON.stringify(result))
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
      log.error('error when fetch comments', {
        error: ex.message,
        center: `${this.planet.commentsBridge}/${this.id.toUpperCase()}`,
      })
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
    log.debug('save public json file succ', this.publicArticlePath)
  }

  getPublicContent() {
    if (this.hasFansOnlyContent()) {
      const pos = this.content.search(/<fansonly/i)
      return this.content.substring(0, pos)
    }
    return this.content
  }

  getFansOnlyContent() {
    if (this.hasFansOnlyContent()) return this.content
  }

  publicRender() {
    let content = this.getPublicContent()
    if (content) {
      log.debug('render public content:', content)
      const content_html = marked.parse(content)
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
            isPublicVersion: true,
          },
          article_title: this.title,
          page_title: this.title,
          content_html: content_html,
          build_timestamp: new Date().getTime(),
        })
      require('fs').writeFileSync(this.publicIndexPath, html)
    }
    content = this.getFansOnlyContent()
    if (content) {
      log.debug('render fansonly content:', content)
      const content_html = marked.parse(content)
      const template = 'blog.html'
      const html = require('../utils/render')
        .getEnv(this.planet)
        .render(template, {
          planet: this.planet,
          planet_ipns: this.planet.ipns,
          assets_prefix: './',
          article: {
            ...this.json(),
            hasAudio: !!this.audioFilename,
            hasVideo: !!this.videoFilename,
            isPublicVersion: false,
          },
          article_title: this.title,
          page_title: this.title,
          content_html: content_html,
          build_timestamp: new Date().getTime(),
        })
      require('fs').writeFileSync(this.fansonlyIndexPath, html)
      log.debug(`render fansonly index succ`, this.fansonlyIndexPath)
      const assetsPath = require('path').join(
        this.planet.constructor.templateBase,
        this.planet.template.toLowerCase(),
        'assets'
      )
      require('fs').cpSync(assetsPath, this.fansonlyAssetsPath, {
        recursive: true,
        force: true,
      })
    }
  }

  async prepareDir() {
    if (!require('fs').existsSync(this.publicBase)) {
      require('fs').mkdirSync(this.publicBase, { recursive: true })
    }
    if (!require('fs').existsSync(this.fansonlyAssetsPath)) {
      require('fs').mkdirSync(this.fansonlyAssetsPath, { recursive: true })
    }
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
