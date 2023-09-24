const core = require("@scbrf/core");
const log = console.log;
async function run() {
  const dataRoot = require("path").join(__dirname, "data");
  if (require("fs").existsSync(dataRoot)) {
    require("fs").rmSync(dataRoot, { recursive: true, force: true });
  }
  require("fs").mkdirSync(dataRoot);
  log("init core ...");
  await core.init({
    PlanetSettingsDocumentRootKey: dataRoot,
    PlanetDefaultLogLevelKey: "error",
  });
  log("observe ipfs state...");
  await new Promise((r) => {
    core.observe(core.ipfs.state, () => {
      if (core.ipfs.state.peers > 0) r();
    });
  });
  console.log("******** IPFS Online");
}
run();
