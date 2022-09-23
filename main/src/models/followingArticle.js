const marked = require('marked')
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: "models/followingArticle"});
const uuid = require('uuid').v4;
const ipfs = require('../utils/ipfs')

class FollowingArticle {
    constructor(a) {
        this.id = a.id || uuid()
        this.link = a.link
        this.title = a.title
        this.content = a.content
        this.created = a.created
        this.read = null
        this.starred = null
        this.videoFilename = a.videoFilename
        this.audioFilename = a.audioFilename
        this.attachments = a.attachments
    }

    get path() {
        return require('path').join(this.planet.articlesPath, `${
            this.id
        }.json`)
    }

    static extractSummary(article, planet) {
        if (article.content.length > 0) {
            if (planet.planetType === '.planet' || planet.planetType === '.ens' || planet.planetType === '.dotbit' || planet.planetType === '.ipns') {
                const html = marked.parse(article.content)
                const dom = new JSDOM(html);
                return dom.window.document.body.textContent.substring(0, 300)
            } else if (planet.planetType === '.dnslink' || planet.planetType == '.dns') {
                return 'dummy summary'
            }
        }
    }

    get url() {
        if (this.planet.planetType === '.ens') {
            return `${
                ipfs.gateway
            }/ipfs/${
                this.planet.cid
            }/${
                this.id
            }/`
        }
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
            attachments: this.attachments
        }
    }

    static create(param, planet) {
        let article = new FollowingArticle(param)
        article.summary = FollowingArticle.extractSummary(article, planet)
        article.planet = planet
        return article
    }
    static load(name, planet) {
        const articlePath = require('path').join(planet.articlesPath, name)
        if (require('fs').existsSync(articlePath)) {
            const json = JSON.parse(require('fs').readFileSync(articlePath).toString())
            const article = FollowingArticle.create(json, planet)
            article.summary = FollowingArticle.extractSummary(article, planet)
            return article
        } else {
            log.info(`${name} not exists!`)
        }
    }
}

module.exports = FollowingArticle