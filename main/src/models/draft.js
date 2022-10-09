const marked = require('marked')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const log = require('../utils/log')('modelsDraft')
const rt = require('./runtime')

const uuid = require('uuid').v4
const Article = require('./article')

class PreviewRender {
  init() {
    this.templatePath = require('path').join(__dirname, '..', '..', 'resources', 'WriterBasic.html')
    this.templates = require('fs').readFileSync(this.templatePath).toString().split('{{ content_html }}')
  }
  render(html) {
    return this.templates.join(html)
  }
}
const render = new PreviewRender()
render.init()

class Draft {
  constructor(planet, article = null, param = {}) {
    this.set(param)
    this.planet = planet
    this.article = article
    if (this.article) {
      this.basePath = require('path').join(this.article.draftsPath, this.id)
    } else {
      this.basePath = require('path').join(this.planet.draftsPath, this.id)
    }
    this.draftsPath = require('path').join(this.basePath, 'Draft.json')
    this.attachmentsPath = require('path').join(this.basePath, 'Attachments')
    this.previewPath = require('path').join(this.attachmentsPath, 'preview.html')

    require('fs').mkdirSync(this.attachmentsPath, { recursive: true })
  }

  static fromArticle(article) {
    const draftPath = require('path').join(article.draftsPath, article.id, 'Draft.json')
    let draft
    if (require('fs').existsSync(draftPath)) {
      const json = JSON.parse(require('fs').readFileSync(draftPath).toString())
      draft = new Draft(article.planet, article, json)
    } else {
      draft = new Draft(article.planet, article, article)
    }

    //对于图片附件，认为是小附件，直接复制以避免冲突
    for (let attachment of draft.attachments) {
      log.debug('copy attachment', [draft.attachmentsPath, attachment.name])
      const attachmentPath = require('path').join(draft.attachmentsPath, attachment.name)
      if (!require('fs').existsSync(attachmentPath)) {
        require('fs').cpSync(require('path').join(article.publicBase, attachment.name), attachmentPath)
      }
    }
    draft.attachments.forEach((a) => {
      a.url = 'file://' + require('path').join(draft.attachmentsPath, a.name)
    })

    //对于大文件，直接引用，提高效率
    if (draft.audioFilename) {
      if (!require('fs').existsSync(draft.audioFilename)) {
        draft.audioFilename = require('path').join(article.publicBase, article.audioFilename)
      }
    }
    if (article.videoFilename) {
      if (!require('fs').existsSync(draft.videoFilename)) {
        draft.videoFilename = require('path').join(article.publicBase, article.videoFilename)
      }
    }
    return draft
  }

  json() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      attachments: this.attachments,
      audioFilename: this.audioFilename,
      videoFilename: this.videoFilename,
      created: this.created,
      updated: this.updated,
    }
  }

  set(param) {
    this.id = param.id || uuid()
    this.title = param.title || ''
    this.content = param.content || ''
    this.attachments = param.attachments || []
    this.audioFilename = param.audioFilename || null
    this.videoFilename = param.videoFilename || null
    const now = new Date().getTime()
    this.created = param.created || now
    this.updated = param.updated || now
    this.isDraft = param.isDraft || false
  }

  save() {
    require('fs').writeFileSync(this.draftsPath, JSON.stringify(this.json()))
    const html = marked.parse(this.content)
    require('fs').writeFileSync(this.previewPath, render.render(html))
  }

  extractSummary() {
    const html = marked.parse(this.content || '')
    const dom = new JSDOM(html)
    return dom.window.document.body.textContent.substring(0, 300)
  }

  async delete() {
    require('fs').rmSync(this.basePath, {
      recursive: true,
      force: true,
    })
  }

  /*
   * 发布一篇操作要做的步骤是:
   *
   * 1: 在 Planet 的 Articles 里创建或者更新 article
   * 2: 在 Public 目录里创建对应的 article 目录
   * 3: 将 Attachments 目录移动到 article
   * 4: 将 article 同步到 Public 目录
   * 5: 将渲染后的结果同步到article 目录
   * 6: 移除草稿文件夹
   * 7: 将 Public 目录加入 ipfs，得到新的CID
   * 8: 发布这个cid
   *
   */
  async publish() {
    const article = Article.fromDraft(this)
    if (!this.article) {
      this.article = article
    }
    await this.confirmBigFileCopy()
    log.info('when publish, created time is', {
      draft: this.created,
      article: article.created,
    })
    article.updated = new Date().getTime()
    article.summary = this.extractSummary()
    await this.publishAttachments(article)
    await article.publicRender()
    await article.save() // save to Planet's Articles
    await this.planet.addArticle(article)
    await this.delete()
    if (this.article) {
      this.article.removeDraft(this)
    } else {
      this.planet.removeDraft(this)
    }
    rt.set({
      middleSideBarArticles: this.planet.articles,
      middleSideBarFocusArticle: article,
    })
    this.planet.publish()
  }

  copyOK(path) {
    return !path || path.startsWith(this.attachmentsPath) || path.startsWith(this.article.publicBase)
  }

  async confirmBigFileCopy() {
    let startat = new Date().getTime()
    while (!this.copyOK(this.audioFilename)) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      if (new Date().getTime() - startat > 5000) {
        startat = new Date().getTime()
        log.error('confirm big copy takes too long!', this.audioFilename)
      }
    }
    while (!this.copyOK(this.videoFilename)) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      if (new Date().getTime() - startat > 5000) {
        startat = new Date().getTime()
        log.error('confirm big copy takes too long!', this.audioFilename)
      }
    }
  }

  //在编辑的时候移除附件
  async removeAttachment(name) {
    const targetName = require('path').basename(name)
    if (targetName === require('path').basename(`${this.audioFilename}`)) {
      this.audioFilename = null
    } else if (targetName === require('path').basename(`${this.videoFilename}`)) {
      this.videoFilename = null
    } else {
      this.attachments = this.attachments.filter((a) => a.name !== targetName)
    }
    this.save()
  }

  async attachAudio(fullpath) {
    if (this.audioFilename && !this.audioFilename.startsWith(this.attachmentsPath)) {
      throw new Error('Conflict')
    }
    const basename = require('path').basename(fullpath)
    this.audioFilename = fullpath
    const target = require('path').join(this.attachmentsPath, basename)
    require('fs').copyFile(fullpath, target, () => {
      this.audioFilename = target
      this.save()
    })
    this.save()
  }

  async addPhotos(pathes) {
    for (let path of pathes) {
      const basename = require('path').basename(path)
      const filter = this.attachments.filter((a) => a.basename === basename)
      if (filter.length === 0) {
        require('fs').copyFileSync(path, require('path').join(this.attachmentsPath, basename))
        this.attachments.push({
          size: require('image-size')(path),
          created: new Date().getTime(),
          name: basename,
          type: 'image',
          url: 'file://' + require('path').join(this.attachmentsPath, basename),
        })
      }
    }
  }

  async attachVideo(fullpath) {
    if (this.videoFilename && !this.videoFilename.startsWith(this.attachmentsPath)) {
      throw new Error('Conflict')
    }
    const basename = require('path').basename(fullpath)
    this.videoFilename = fullpath
    const target = require('path').join(this.attachmentsPath, basename)
    require('fs').copyFile(fullpath, target, () => {
      this.videoFilename = target
      this.save()
    })
    this.save()
  }

  async publishAttachmentsWin32(article) {
    if (!require('fs').existsSync(article.publicBase)) {
      require('fs').mkdirSync(article.publicBase, { recursive: true })
    }

    for (let item of article.attachments || []) {
      require('fs').cpSync(
        require('path').join(this.attachmentsPath, item.name),
        require('path').join(article.publicBase, item.name)
      )
    }
    if (this.audioFilename && !this.audioFilename.startsWith(article.publicBase)) {
      require('fs').cpSync(
        this.audioFilename,
        require('path').join(article.publicBase, require('path').basename(this.audioFilename))
      )
    }
    if (this.videoFilename && !this.videoFilename.startsWith(article.publicBase)) {
      require('fs').cpSync(
        this.videoFilename,
        require('path').join(article.publicBase, require('path').basename(this.videoFilename))
      )
    }
  }

  async publishAttachments(article) {
    //由于windows系统对于重命名或者删除操作过于严格的限制，这里直接进行拷贝，不做复杂判断
    //可能造成的后果就是Public目录里可能遗留一些没有用到的文件，这个问题可以通过后期在适当时机整理public目录
    //进行优化

    if (process.platform === 'win32') {
      this.publishAttachmentsWin32(article)
      return
    }

    if (require('fs').existsSync(article.publicBase)) {
      //首先将用到的Public目录的文件拷贝过来
      if (this.audioFilename && this.audioFilename.startsWith(article.publicBase)) {
        const target = require('path').join(this.attachmentsPath, require('path').basename(this.audioFilename))
        require('fs').renameSync(this.audioFilename, target)
        this.audioFilename = target
      }
      if (this.videoFilename && this.videoFilename.startsWith(article.publicBase)) {
        const target = require('path').join(this.attachmentsPath, require('path').basename(this.videoFilename))
        require('fs').renameSync(this.videoFilename, target)
        this.videoFilename = target
      }
      //将剩余的Public目录整个删除重建
      require('fs').rmSync(article.publicBase, { recursive: true, force: true })
    }

    require('fs').mkdirSync(article.publicBase, { recursive: true })

    //再将其用到的文件拷贝过去
    for (let item of this.attachments || []) {
      require('fs').renameSync(
        require('path').join(this.attachmentsPath, item.name),
        require('path').join(article.publicBase, item.name)
      )
    }
    if (this.audioFilename) {
      const target = require('path').join(article.publicBase, require('path').basename(this.audioFilename))
      require('fs').renameSync(this.audioFilename, target)
    }
    if (this.videoFilename) {
      const target = require('path').join(article.publicBase, require('path').basename(this.videoFilename))
      require('fs').renameSync(this.videoFilename, target)
    }
  }
}

module.exports = Draft
