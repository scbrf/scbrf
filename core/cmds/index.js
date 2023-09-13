function listJS(base) {
  return require("fs")
    .readdirSync(require("path").join(__dirname, base))
    .reduce((r, i) => {
      const name = i.slice(0, -3);
      r[
        `${base}${name[0].toUpperCase()}${name.slice(1)}`
      ] = require(`${base}/${i}`);
      return r;
    }, {});
}
module.exports = {
  ...listJS("planet"),
};
