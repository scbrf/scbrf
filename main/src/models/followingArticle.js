const marked = require('marked')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const log = require('../utils/log')('modelsFollowingArticle')

const uuid = require('uuid').v4
const ipfs = require('../utils/ipfs')

class FollowingArticle {
  static PublicRoot
  constructor(a, planet) {
    this.id = (a.id || uuid()).toUpperCase()
    this.link = a.link
    this.title = a.title
    this.content = a.content
    this.created = a.created
    this.read = a.read || false
    this.starred = a.starred || false
    this.pinState = a.pinState || ''
    this.videoFilename = a.videoFilename
    log.debug(`*********** load following article ${this.title}  ....`)
    if (this.videoFilename) {
      this.videoThumbnailPath = `${planet.constructor.PublicRoot}/thumbnail/${this.id}.thumbnail.jpg`
    }
    this.audioFilename = a.audioFilename
    this.attachments = a.attachments
  }

  get path() {
    return require('path').join(this.planet.articlesPath, `${this.id}.json`)
  }

  async decryptFansCID() {
    log.debug('need decrypt artilce ...', this.title)
    if (!this.cidPin) {
      log.error('should only be called after pin ready!')
      return
    }
    const fansUrl = `${require('../utils/ipfs').gateway}/ipfs/${this.cidPin}/fans.json`
    try {
      const data = await require('axios').get(fansUrl)
      log.debug('got encrypt data', data.data)
      const myaddr = require('../utils/wallet').wallet.address
      if (!data.data[myaddr]) {
        log.info(`my address ${myaddr} is not in the encrypted addresses!`)
        return
      }
      log.debug('need decrypt data', data.data[myaddr])
      const encryptedObject = require('eth-crypto').cipher.parse(data.data[myaddr])
      const decrypted = await require('eth-crypto').decryptWithPrivateKey(
        require('../utils/wallet').wallet.privateKey,
        encryptedObject
      )
      log.debug('after decrypt, the origin message is', decrypted)
      return decrypted
    } catch (ex) {
      log.error('error on fetch decrypt', ex.message)
    }
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

  fansOnlyReadable() {
    return !!this.fansCid
  }

  attchmentIsFansOnly(attach) {
    if (!this.hasFansOnlyContent()) return false
    const pos = this.content.search(new RegExp(`<img[^>]*src="${attach.name || attach}"`))
    if (pos < 0) return true
    const fansonlyPos = this.content.search(/<fansonly/i)
    return pos > fansonlyPos
  }

  // hasFansOnlyContent() {
  //   return !!this.fansCid
  // }

  // attchmentIsFansOnly(attach) {
  //   if (!this.hasFansOnlyContent()) return false
  //   const pos = this.content.search(new RegExp(`<img[^>]*src="${attach.name || attach}"`))
  //   if (pos < 0) return true
  //   const fansonlyPos = this.content.search(/<fansonly/i)
  //   return pos > fansonlyPos
  // }

  url(fansOnly) {
    if (fansOnly && this.fansCid) {
      return `${ipfs.gateway}/ipfs/${this.fansCid}/`
    }
    return `${ipfs.gateway}/ipfs/${this.planet.cid}/${this.id}/`
  }

  save() {
    require('fs').writeFileSync(this.path, JSON.stringify(this.json()))
  }

  json() {
    return {
      id: this.id,
      link: this.link,
      title: this.title,
      content: this.content,
      summary: this.summary,
      created: this.created,
      read: this.read,
      starred: this.starred,
      videoFilename: this.videoFilename,
      audioFilename: this.audioFilename,
      attachments: this.attachments,
    }
  }

  async delete() {
    require('fs').rmSync(this.path)
  }

  static create(param, planet) {
    let article = new FollowingArticle(param, planet)
    article.summary = FollowingArticle.extractSummary(article, planet)
    article.planet = planet
    return article
  }
  /**
   *
   * 从本地文件系统中读取单篇文章
   * @param {*} name
   * @param {*} planet
   * @returns
   */
  static load(name, planet) {
    const articlePath = require('path').join(planet.articlesPath, name)
    if (require('fs').existsSync(articlePath)) {
      try {
        const json = JSON.parse(require('fs').readFileSync(articlePath).toString())
        const article = FollowingArticle.create(json, planet)
        article.summary = FollowingArticle.extractSummary(article, planet)
        return article
      } catch (ex) {
        log.error('exception when load article', ex)
        return null
      }
    } else {
      log.info(`${name} not exists!`)
    }
  }
}

module.exports = FollowingArticle
