const core = require("@scbrf/core");
async function main() {
  await core.init({
    ipfsroot: require("path").join(__dirname, "data", "ipfs"),
  });
}

main();
