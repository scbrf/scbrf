const S = require("./setting");
module.exports = function getLog(name) {
  var bunyan = require("bunyan");
  let level;
  if (process.env["NODE_ENV"] == "test") {
    level = "error";
  } else {
    level = S.get(S.defaultLogLevel, "error");
  }
  var log = bunyan.createLogger({
    name,
    level,
    serializers: bunyan.stdSerializers,
  });
  return log;
};
