const { exportJS } = require("../utils");
module.exports = {
  ...exportJS(__dirname, "planet"),
  ...exportJS(__dirname, "follow"),
  ...exportJS(__dirname, "article"),
};
