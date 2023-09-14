const { exportJS } = require("../utils");
module.exports = {
  ...exportJS("planet"),
  ...exportJS("follow"),
  ...exportJS("article"),
};
