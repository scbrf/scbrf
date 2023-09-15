const core = require("@scbrf/core");
async function main() {
  core.observe(core.ipfs.state, (change) => {
    console.log("**********************", change);
    console.log(
      "====================->",
      core.ipfs.state.online,
      core.ipfs.state.peers
    );
  });
  await core.init({
    ipfsroot: require("path").join(__dirname, "data", "ipfs"),
  });
}

main();
