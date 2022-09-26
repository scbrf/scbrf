const marked = require('marked')
const log = require('../utils/log')('models/planet')

const uuid = require('uuid').v4
const ipfs = require('../utils/ipfs')
const rt = require('./runtime')
const Draft = require('./draft')
const Article = require('./article')

class Planet {
  static myPlanetsPath
  static templateBase = require('path').join(__dirname, '..', '..', '..', 'templates')

  constructor(params) {
    this.name = params.name
    this.about = params.about || ''
    this.template = params.template || 'Plain'
    this.id = params.id || uuid()
    const now = new Date().getTime()
    this.created = params.created || now
    this.updated = params.updated || now
    this.ipns = params.ipns || null
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
    this.publicBasePath = require('path').join(this.basePath, 'Public')
    this.publicInfoPath = require('path').join(this.publicBasePath, 'planet.json')
    this.publicAvatarPath = require('path').join(this.publicBasePath, 'avatar.png')
    this.publicFaviconPath = require('path').join(this.publicBasePath, 'favicon.ico')
    this.publicIndexPath = require('path').join(this.publicBasePath, 'index.html')
    this.publicAssetsPath = require('path').join(this.publicBasePath, 'assets')
  }

  // 加载 Drafts 里面的所有 Draft
  async loadDrafts() {
    const drafts = await new Promise((resolve) => {
      require('fs').readdir(this.draftsPath, (err, files) => {
        resolve(files)
      })
    })
    for (let id of drafts) {
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
    rt.planets = [...rt.planets]
  }

  sortArticles() {
    this.articles = this.articles.sort((a, b) => b.created - a.created)
  }

  /**
   * 渲染根目录的index.html
   */
  publicRender() {
    const pageAboutHTML = marked.parse(this.about)
    const template = 'index.html'
    const html = require('../utils/render').getEnv(this).render(template, {
      assets_prefix: './',
      page_title: this.name,
      page_description: this.about,
      page_description_html: pageAboutHTML,
      articles: this.articles,
      build_timestamp: new Date().getTime(),
    })
    require('fs').writeFileSync(this.publicIndexPath, html)
  }

  static async load(id) {
    const planetPath = require('path').join(Planet.myPlanetsPath, id, 'planet.json')
    if (require('fs').existsSync(planetPath)) {
      const json = JSON.parse(require('fs').readFileSync(planetPath).toString())
      log.info(`load planet from id ${id} got`, json)
      const planet = new Planet(json)
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
      template: this.template,
      created: this.created,
      updated: this.updated,
      lastPublished: this.lastPublished,
    }
  }
  copyTemplateAssets() {
    const src = require('path').join(Planet.templateBase, this.template.toLowerCase(), 'assets')
    require('fs').cpSync(src, this.publicAssetsPath, {
      recursive: true,
      force: true,
    })
  }
  save() {
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
  }
  async publish() {
    if (this.publishing) {
      return
    }
    this.publishing = true
    rt.planets = [...rt.planets]
    await this.savePublic()
    await this.publicRender()
    await Promise.all(
      this.articles.map((a) => async () => {
        await a.savePublic()
        await a.publicRender()
      })
    )

    try {
      const cid = await ipfs.addDirectory(this.publicBasePath)
      log.info('publish dir return:', cid)
      await ipfs.publish(this.id, cid)
    } catch (ex) {
      log.error('publish error', ex)
    }
    this.publishing = false
    this.lastPublished = new Date().getTime()
    rt.planets = [...rt.planets]
  }
  static startPublish() {
    setInterval(() => {
      for (let planet of Planet.planets) {
        if (planet.articles.length > 0) {
          planet.publish()
        }
      }
    }, 30 * 60 * 1000) // 每30分钟重新发布一次本地 Planet
  }
  static async loadPlanets() {
    Planet.planets = []
    const planets = await new Promise((resolve) => {
      require('fs').readdir(Planet.myPlanetsPath, (err, files) => {
        resolve(files)
      })
    })
    log.info('read planet dir get', planets)
    for (let id of planets || []) {
      const planet = await Planet.load(id)
      const articles = await new Promise((resolve) => {
        require('fs').readdir(planet.articlesPath, (err, files) => {
          resolve(files)
        })
      })
      for (let name of articles) {
        const article = Article.load(name, planet)
        if (article) {
          planet.articles.push(article)
        }
      }
      planet.articles.sort((a, b) => b.created - a.created)
      rt.planets.push(planet)
    }
    log.info('load planet done!')
  }
}

module.exports = Planet
