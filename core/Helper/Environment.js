const nunjucks = require("nunjucks");
const moment = require("moment");
const marked = require("marked");
const { timeFromReferenceDate } = require("../utils");

class PlanetLoader {
  constructor(opts) {
    this.options = opts;
  }
  getSource(name) {
    return {
      src: require("fs")
        .readFileSync(require("path").join(this.options.base, name))
        .toString(),
      path: name,
    };
  }
}

class Environment {
  constructor(base) {
    this.env = new nunjucks.Environment(new PlanetLoader({ base }), {
      autoescape: false,
    });
    this.env.addFilter("rfc822", (str) => {
      return moment(timeFromReferenceDate(parseFloat(str))).format(
        "MMM D,YYYY [at] h:mm:ss A"
      );
    });
    this.env.addFilter("md2html", (str) => {
      return marked.parse(str);
    });
    this.env.addFilter("absoluteImageURL", function (str, prefix, articleid) {
      //TODO
      return str;
    });
  }
  preCompile(cnt) {
    return cnt.replaceAll(
      "absoluteImageURL:root_prefix,article.id",
      "absoluteImageURL(root_prefix,article.id)"
    );
  }
  renderTemplate({ name, string, context }) {
    if (string) {
      return this.env.renderString(this.preCompile(string), context);
    } else {
      return this.env.render(name, context);
    }
  }
}
module.exports = Environment;
