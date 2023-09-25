// const core = require("@scbrf/core");
const core = require("../core");
const { expect } = require("expect");
const log = console.log;
const AudioPath = "/Users/wwq/Music/网易云音乐/热河.mp3";
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
    tags: { test: "test" },
  });
  expect(draft.id).toBe(draftID);
  expect(draft.content).toBe("This is new Content");
  await core.commands.articleAttachfile({
    draftID,
    path: AudioPath,
    type: ".audio",
  });
  const article = await core.commands.articlePublish({ draftID });
  expect(
    require("fs").existsSync(
      require("path").join(article.publicBasePath, `${this.name}.html`)
    )
  );
  log("Done");
}
run();
