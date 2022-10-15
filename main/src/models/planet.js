const marked = require('marked')
const log = require('../utils/log')('modelsPlanet')

const uuid = require('uuid').v4
const ipfs = require('../utils/ipfs')
const rt = require('./runtime')
const Draft = require('./draft')
const Article = require('./article')

class Planet {
  static myPlanetsPath
  static PublicRoot
  static templateBase = require('path').join(__dirname, '..', '..', '..', 'templates')

  constructor(params) {
    this.name = params.name
    this.about = params.about || ''
    this.template = params.template || 'plain'
    //let's just keep old uuid on planetid since it is bind to ipfs key name
    this.id = params.id || uuid().toUpperCase()
    const now = new Date().getTime()
    this.created = params.created || now
    this.updated = params.updated || now
    this.ipns = params.ipns || null
    this.commentsBridge = params.commentsBridge || ''
    this.githubUsername = params.githubUsername || null
    this.twitterUsername = params.twitterUsername || null
    this.lastPublished = params.lastPublished || now
    this.articles = []
    this.drafts = []

    this.basePath = require('path').join(Planet.myPlanetsPath, this.id)
    this.infoPath = require('path').join(this.basePath, 'planet.json')
    this.articlesPath = require('path').join(this.basePath, 'Articles')
    this.avatarPath = require('path').join(this.basePath, 'avatar.png')
    this.faviconPath = require('path').join(this.basePath, 'favicon.ico')
    this.draftsPath = require('path').join(this.basePath, 'Drafts')
    this.articleDraftsPath = require('path').join(this.articlesPath, 'Drafts')
    this.publicBasePath = require('path').join(Planet.PublicRoot, this.id)
    this.publicInfoPath = require('path').join(this.publicBasePath, 'planet.json')
    this.publicAvatarPath = require('path').join(this.publicBasePath, 'avatar.png')
    this.publicFaviconPath = require('path').join(this.publicBasePath, 'favicon.ico')
    this.publicIndexPath = require('path').join(this.publicBasePath, 'index.html')
    this.publicAssetsPath = require('path').join(this.publicBasePath, 'assets')
  }

  // 加载 Drafts 里面的所有 Draft
  async loadDrafts() {
    this.drafts = []
    const drafts = await new Promise((resolve) => {
      require('fs').readdir(this.draftsPath, (err, files) => {
        resolve(files)
      })
    })
    for (let id of drafts || []) {
      const draftPath = require('path').join(this.draftsPath, id, 'Draft.json')
      if (require('fs').existsSync(draftPath)) {
        const params = JSON.parse(require('fs').readFileSync(draftPath))
        const draft = new Draft(this, null, params)
        this.drafts.push(draft)
      }
    }
    this.drafts.sort((a, b) => b.created - a.created)
  }

  /**
   * 如果article已经存在，替换，否则，添加，然后排序
   * @param {*} article
   */
  addArticle(article) {
    const articles = this.articles.filter((a) => a.id !== article.id)
    this.articles = [article, ...articles]
    this.sortArticles()
  }

  sortArticles() {
    this.articles = this.articles.sort((a, b) => b.created - a.created)
  }

  /**
   * 渲染根目录的index.html
   */
  publicRender() {
    const pageAboutHTML = marked.parse(this.about)
    log.info('during public render, about info is', { about: this.about, html: pageAboutHTML })
    const template = 'index.html'
    const html = require('../utils/render')
      .getEnv(this)
      .render(template, {
        assets_prefix: './',
        page_title: this.name,
        has_avatar: !!this.avatar,
        page_description: pageAboutHTML,
        page_description_html: pageAboutHTML,
        articles: this.articles.map((a) => ({
          ...a.json(),
          hasAudio: !!a.audioFilename,
          hasVideo: !!a.videoFilename,
          link: `/${a.id}/`,
        })),
        build_timestamp: new Date().getTime(),
      })
    require('fs').writeFileSync(this.publicIndexPath, html)
    log.info('public index updated', this.publicIndexPath)
  }

  static async load(id) {
    const planetPath = require('path').join(Planet.myPlanetsPath, id, 'planet.json')
    if (require('fs').existsSync(planetPath)) {
      const json = JSON.parse(require('fs').readFileSync(planetPath).toString())
      log.info(`load planet from id ${id} got`, json)
      const planet = new Planet(json)
      if (require('fs').existsSync(planet.avatarPath)) {
        planet.avatar = 'avatar.png'
      }
      await planet.loadDrafts()
      return planet
    } else {
      log.info(`${id} has an empty planet!`)
    }
  }

  async delete() {
    require('fs').rmSync(this.basePath, {
      force: true,
      recursive: true,
    })
  }

  static async create(param) {
    log.info('create planet from param', param)
    const planet = new Planet(param)
    if (!planet.ipns) {
      planet.ipns = await ipfs.generateKey(planet.id)
    }
    planet.avatar = null
    planet.drafts = []
    planet.articles = []

    require('fs').mkdirSync(planet.basePath, { recursive: true })
    require('fs').mkdirSync(planet.articlesPath, { recursive: true })
    require('fs').mkdirSync(planet.draftsPath, { recursive: true })
    require('fs').mkdirSync(planet.articleDraftsPath, { recursive: true })
    require('fs').mkdirSync(planet.publicBasePath, { recursive: true })
    await planet.copyTemplateAssets()
    return planet
  }
  json() {
    return {
      id: this.id,
      ipns: this.ipns,
      name: this.name,
      about: this.about,
      commentsBridge: this.commentsBridge,
      template: this.template,
      created: this.created,
      updated: this.updated,
      githubUsername: this.githubUsername,
      twitterUsername: this.twitterUsername,
      lastPublished: this.lastPublished,
    }
  }
  copyTemplateAssets() {
    const src = require('path').join(Planet.templateBase, this.template.toLowerCase(), 'assets')
    require('fs').cpSync(src, this.publicAssetsPath, {
      recursive: true,
      force: true,
    })
    log.info('copt assets dir done', {
      from: src,
      to: this.publicAssetsPath,
    })
  }
  save() {
    if (!require('fs').existsSync(this.basePath)) {
      require('fs').mkdirSync(this.basePath, { recursive: true })
    }
    require('fs').writeFileSync(this.infoPath, JSON.stringify(this.json()))
  }
  removeDraft(draft) {
    this.drafts = this.drafts.filter((d) => d.id !== draft.id)
  }
  /**
   * Public目录下的planet.json文件
   */
  savePublic() {
    log.info('when save public, article create date is', this.articles.length && this.articles[0].created)
    if (!require('fs').existsSync(this.publicBasePath)) {
      require('fs').mkdirSync(this.publicBasePath, { recursive: true })
    }
    require('fs').writeFileSync(
      this.publicInfoPath,
      JSON.stringify({
        about: this.about,
        created: require('../utils/datetime').timeIntervalSinceReferenceDate(this.created),
        id: this.id,
        ipns: this.ipns,
        name: this.name,
        updated: require('../utils/datetime').timeIntervalSinceReferenceDate(this.updated),
        articles: this.articles.map((a) => ({
          attachments: [
            ...(a.audioFilename ? [a.audioFilename] : []),
            ...(a.videoFilename ? [a.videoFilename] : []),
            ...a.attachments.map((a) => a.name),
          ],
          content: a.content,
          created: require('../utils/datetime').timeIntervalSinceReferenceDate(a.created),
          hasAudio: !!a.audioFilename,
          hasVideo: !!a.videoFilename,
          id: a.id.toUpperCase(),
          link: `/${a.id}/`,
          title: a.title,
          audioFilename: a.audioFilename,
          videoFilename: a.videoFilename,
        })),
      })
    )
    if (require('fs').existsSync(this.avatarPath)) {
      log.info('save avatar to public dir ...', this.avatarPath)
      require('fs').cpSync(this.avatarPath, this.publicAvatarPath)
    }
  }
  async publish() {
    if (this.publishing) {
      return
    }
    this.publishing = true
    rt.planets = [...rt.planets]
    await this.savePublic()
    await this.publicRender()
    await this.copyTemplateAssets()

    try {
      await Promise.all(this.articles.map((a) => a.publishComments()))
      log.info('save comments finish!')
    } catch (ex) {
      log.error('刷新评论异常，继续', ex)
    }

    await Promise.all(
      this.articles.map(async (a) => {
        log.info('during public,save to public dir', a.id)
        await a.savePublic()
        await a.publicRender()
      })
    )

    try {
      const cid = await ipfs.addDirectory(this.publicBasePath)
      log.debug('publish dir return:', cid)
      await ipfs.publish(this.id, cid)
      log.info(`publish site succ`, { key: this.id, cid })
    } catch (ex) {
      log.error('publish site error', { key: this.id, ex })
    }
    this.publishing = false
    this.lastPublished = new Date().getTime()
    this.save()
    rt.planets = [...rt.planets]
  }

  async republish() {
    if (this.publishing) {
      return
    }
    this.publishing = true
    rt.planets = [...rt.planets]

    try {
      await Promise.all(this.articles.map((a) => a.publishComments()))
    } catch (ex) {
      log.error('刷新评论异常，继续', ex)
    }

    try {
      log.debug('refresh comments done!')
      const cid = await ipfs.addDirectory(this.publicBasePath)
      log.info('publish dir return:', { planetid: this.id, cid })
      await ipfs.publish(this.id, cid)
    } catch (ex) {
      log.error('error when republish', ex.toString())
    }
    this.publishing = false
    this.lastPublished = new Date().getTime()
    this.save()
    rt.planets = [...rt.planets]
  }

  static async migrate() {
    if (!require('fs').existsSync(Planet.PublicRoot)) {
      require('fs').mkdirSync(Planet.PublicRoot, { recursive: true })
    }
    for (let planet of rt.planets) {
      const oldPublic = require('path').join(planet.basePath, 'Public')
      if (require('fs').existsSync(oldPublic) && !require('fs').existsSync(planet.publicBasePath)) {
        require('fs').renameSync(oldPublic, planet.publicBasePath)
      }
    }
  }

  static async loadPlanets() {
    let ps = []
    const planets = await new Promise((resolve) => {
      require('fs').readdir(Planet.myPlanetsPath, (err, files) => {
        resolve(files)
      })
    })
    log.info(`read planet from ${Planet.myPlanetsPath} get`, planets)
    for (let id of planets || []) {
      const planet = await Planet.load(id)
      if (!planet) continue
      const articles = await new Promise((resolve) => {
        require('fs').readdir(planet.articlesPath, (err, files) => {
          resolve(files)
        })
      })
      for (let name of articles || []) {
        const article = await Article.load(name, planet)
        if (article) {
          planet.articles.push(article)
        }
      }
      planet.articles.sort((a, b) => b.created - a.created)
      ps.push(planet)
    }
    rt.planets = ps
    log.info('load planet done!')
  }
}

module.exports = Planet
