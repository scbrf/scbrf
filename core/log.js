const S = require("./setting");
module.exports = function getLog(name) {
  var bunyan = require("bunyan");
  var log = bunyan.createLogger({
    name,
    level:
      process.env["NODE_ENV"] == "test"
        ? "error"
        : S.get(S.defaultLogLevel, "info"),
  });
  return log;
};
