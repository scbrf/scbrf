const core = require("@scbrf/core");
const { expect } = require("expect");
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
  log("******** IPFS Online");
  const planet = await core.commands.planetCreate({
    name: "test",
    about: "a test site",
    templateName: "Plain",
  });
  expect(planet.id).toBe(planet.id.toUpperCase());

  const { id: draftID } = await core.commands.articleCreate({
    planetID: planet.id,
  });
  const draft = await core.commands.articleModify({
    draftID,
    title: "New Title",
    content: "This is new Content",
    tags: ["test"],
  });
  expect(draft.id).toBe(draftID);
  expect(draft.content).toBe("This is new Content");
  const article = await core.commands.articlePublish({ draftID });

  log("Done");
  process.exit();
}
run();
