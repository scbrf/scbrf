module.exports = function getLog(name) {
  var bunyan = require("bunyan");
  var log = bunyan.createLogger({
    name,
    level: process.env["NODE_ENV"] == "test" ? "error" : "info",
  });
  return log;
};
