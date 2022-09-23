const portfinder = require('portfinder')
const Koa = require('koa')
const serve = require('koa-static')

class WebSrv {
    async init() {
        if (process.env.WEBROOT) {
            this.WebRoot = process.env.WEBROOT
        } else {
            const port = await portfinder.getPortPromise({
                port: 5789, // minimum port
                stopPort: 5799
            })
            this.WebRoot = `http://127.0.0.1:${port}`
            this.startListen(port)
        }
    }
    startListen(port) {
        const app = new Koa();
        let root = require('path').join(__dirname, '..', '..', '..', 'dist')
        app.use(serve(root));
        app.use((ctx) => {
            if (ctx.status == 404) {
                ctx.set('Content-type', 'text/html');
                ctx.body = require('fs').createReadStream(require('path').join(root, 'index.html'));
            }
        })
        app.listen(port);
    }
}

module.exports = new WebSrv()
