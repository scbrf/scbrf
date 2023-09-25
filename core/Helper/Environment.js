const nunjucks = require("nunjucks");
const moment = require("moment");
const marked = require("marked");
const { timeFromReferenceDate } = require("../utils");
function preCompile(cnt) {
  cnt = cnt.replaceAll(
    "absoluteImageURL:root_prefix,article.id",
    "absoluteImageURL(root_prefix,article.id)"
  );
  cnt = cnt.replaceAll(".count", ".length");
  cnt = cnt.replaceAll("tags[tag]", "tag_names[tag]");
  return cnt;
}

class PlanetLoader {
  constructor(opts) {
    this.options = opts;
  }
  getSource(name) {
    let src = require("fs")
      .readFileSync(require("path").join(this.options.base, name))
      .toString();
    src = preCompile(src);
    return {
      src,
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
    this.env.addFilter("ymd", function (value) {
      return moment(value).format("YYYY-MM-DD");
    });
    this.env.addFilter("formatDateC", function (value) {
      return moment(value).format("YYYY-MM-DD");
    });
    this.env.addFilter("formatDate", function (value) {
      return moment(value).format("YYYY-MM-DD");
    });
  }
  renderTemplate({ name, string, context }) {
    if (string) {
      return this.env.renderString(preCompile(string), context);
    } else {
      return this.env.render(name, context);
    }
  }
}
module.exports = Environment;
