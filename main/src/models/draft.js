const marked = require('marked')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const log = require('../utils/log')('modelsDraft')
const rt = require('./runtime')
const evt = require('../utils/events')

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
        if (require('fs').existsSync(require('path').join(article.fansonlyBase, attachment.name))) {
          require('fs').cpSync(require('path').join(article.fansonlyBase, attachment.name), attachmentPath)
        } else {
          require('fs').cpSync(require('path').join(article.publicBase, attachment.name), attachmentPath)
        }
      }
    }
    draft.attachments.forEach((a) => {
      a.url = 'file://' + require('path').join(draft.attachmentsPath, a.name)
    })

    //对于大文件，直接引用，提高效率
    if (article.audioFilename) {
      if (!require('fs').existsSync(draft.audioFilename)) {
        if (require('fs').existsSync(require('path').join(article.fansonlyBase, article.audioFilename))) {
          draft.audioFilename = require('path').join(article.fansonlyBase, article.audioFilename)
        } else {
          draft.audioFilename = require('path').join(article.publicBase, article.audioFilename)
        }
      }
    }
    if (article.videoFilename) {
      if (!require('fs').existsSync(draft.videoFilename)) {
        if (require('fs').existsSync(require('path').join(article.fansonlyBase, article.videoFilename))) {
          draft.videoFilename = require('path').join(article.fansonlyBase, article.videoFilename)
        } else {
          draft.videoFilename = require('path').join(article.publicBase, article.videoFilename)
        }
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
    this.id = (param.id || uuid()).toUpperCase()
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
    await article.prepareDir()

    log.debug('when publish, created time is', {
      draft: this.created,
      article: article.created,
    })
    article.updated = new Date().getTime()
    article.summary = this.extractSummary()
    await this.publishAttachments(article)
    log.debug(`publish arrachments finish!`)
    await article.publicRender()
    log.debug(`article public render finish!`)
    await article.save() // save to Planet's Articles
    log.debug(`article save finish!`)
    await this.planet.addArticle(article)
    log.debug(`article added to planet!`)
    await this.delete()
    log.debug(`draft deleted!`)
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

  //mkdir a temp dir, cp everything there, close all file which may be opened, rename the temp dir to target.
  async publishAttachments(article) {
    const tmpPublicDir = require('fs').mkdtempSync(require('path').join(require('os').tmpdir(), `scbrf_public_`))
    let tmpFansDir
    if (article.hasFansOnlyContent()) {
      tmpFansDir = require('fs').mkdtempSync(require('path').join(require('os').tmpdir(), `scbrf_fansonly_`))
    }
    for (let item of article.attachments || []) {
      if (article.attchmentIsFansOnly(item)) {
        require('fs').cpSync(
          require('path').join(this.attachmentsPath, item.name),
          require('path').join(tmpFansDir, item.name)
        )
      } else {
        require('fs').cpSync(
          require('path').join(this.attachmentsPath, item.name),
          require('path').join(tmpPublicDir, item.name)
        )
        if (article.hasFansOnlyContent()) {
          require('fs').cpSync(
            require('path').join(this.attachmentsPath, item.name),
            require('path').join(tmpFansDir, item.name)
          )
        }
      }
    }
    if (this.audioFilename) {
      const previewLen = article.mediaPreviewLen()
      if (article.hasFansOnlyContent() && previewLen > 0) {
        const previewPath = require('path').join(tmpPublicDir, require('path').basename(this.audioFilename))
        await article.buildPreviewMedia(this.audioFilename, previewPath, previewLen)
        require('fs').cpSync(
          this.audioFilename,
          require('path').join(tmpFansDir, require('path').basename(this.audioFilename))
        )
      } else {
        require('fs').cpSync(
          this.audioFilename,
          require('path').join(tmpPublicDir, require('path').basename(this.audioFilename))
        )
      }
    }
    if (this.videoFilename) {
      const previewLen = article.mediaPreviewLen()
      if (article.hasFansOnlyContent() && previewLen > 0) {
        const previewPath = require('path').join(tmpPublicDir, require('path').basename(this.videoFilename))
        await article.buildPreviewMedia(this.videoFilename, previewPath, previewLen)
        require('fs').cpSync(
          this.videoFilename,
          require('path').join(tmpFansDir, require('path').basename(this.videoFilename))
        )
      } else {
        require('fs').cpSync(
          this.videoFilename,
          require('path').join(tmpPublicDir, require('path').basename(this.videoFilename))
        )
      }
    }

    if (require('fs').existsSync(article.publicBase)) {
      //TODO any module which prevent rmSync, should handle this event and close handler!
      evt.emit(evt.evCloseFileHandler, article.id)
      while (true) {
        try {
          log.debug(`try to remove old public base`, article.publicBase)
          require('fs').rmSync(article.publicBase, { recursive: true, force: true })
          break
        } catch (ex) {
          log.error(`error rm public dir: ${ex.toString()}`)
          await new Promise((r) => setTimeout(r, 1000))
        }
      }
    }

    if (tmpFansDir && require('fs').existsSync(article.fansonlyBase)) {
      while (true) {
        try {
          log.debug(`try to remove old fansonly base`, article.fansonlyBase)
          require('fs').rmSync(article.fansonlyBase, { recursive: true, force: true })
          break
        } catch (ex) {
          log.error(`error rm public dir: ${ex.toString()}`)
          await new Promise((r) => setTimeout(r, 1000))
        }
      }
    }

    require('fs').renameSync(tmpPublicDir, article.publicBase)
    if (tmpFansDir) {
      require('fs').renameSync(tmpFansDir, article.fansonlyBase)
    }
  }
}

module.exports = Draft
