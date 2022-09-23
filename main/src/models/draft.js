const marked = require('marked')
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: "models/draft"});
const uuid = require('uuid').v4;
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

        require('fs').mkdirSync(this.attachmentsPath, {recursive: true})
    }

    static fromArticle(article) {
        return new Draft(article.planet, article, article)
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
            updated: this.updated
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
        const dom = new JSDOM(html);
        return dom.window.document.body.textContent.substring(0, 300)
    }

    async delete() {
        require('fs').rmSync(this.basePath, {
            recursive: true,
            force: true
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
        log.info('when publish, created time is', {
            draft: this.created,
            article: article.created
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
        this.planet.publish()
    }

    async publishAttachments(article) {
        const items = await new Promise(resolve => {
            require('fs').readdir(this.attachmentsPath, (err, files) => {
                resolve(files)
            })
        })
        if (!require('fs').existsSync(article.publicBase)) {
            require('fs').mkdirSync(article.publicBase, {recursive: true})
        }
        for (let item of items) {
            if (item === 'preview.html') {
                continue
            }

            require('fs').renameSync(require('path').join(this.attachmentsPath, item), require('path').join(article.publicBase, item))
        }
    }
}

module.exports = Draft
