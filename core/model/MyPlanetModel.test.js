class MockFS {
  static fs = {};
  constructor() {
    MockFS.fs = {};
  }
  existsSync(path) {
    return MockFS.fs[path];
  }
  mkdirSync(path) {
    MockFS.fs[path] = true;
  }
  cpSync() {}
  writeFileSync(path, cnt) {
    MockFS.fs[path] = cnt;
  }
}
jest.mock("fs", () => new MockFS());
jest.mock("../ipfs");
jest.mock("../Helper/TemplateStore", () => ({
  get: () => ({
    assetsPath: "",
    renderIndex() {},
  }),
}));
const MyPlanetModel = require("./MyPlanetModel");
const utils = require("../utils");
test("create planet", async () => {
  const planet = await MyPlanetModel.create({
    name: "test",
    about: "about",
    templateName: "plain",
  });
  expect(planet.name).toBe("test");
  planet.save();
  await planet.savePublic();
  const planetInfoJson = Object.keys(MockFS.fs).filter(
    (a) => a.endsWith("planet.json") && a.indexOf("My") >= 0
  )[0];
  const infoJson = JSON.parse(MockFS.fs[planetInfoJson]);
  expect(infoJson.name).toBe("test");
  expect(infoJson.id).toBe(infoJson.id.toUpperCase());
  expect(infoJson.podcastLanguage).toBe("en");
  expect(infoJson.tags).toEqual({});
  expect(infoJson.templateName).toBe("plain");

  expect(
    Math.abs(infoJson.created - utils.timeToReferenceDate(new Date()))
  ).toBeLessThan(1);
  expect(
    Math.abs(infoJson.updated - utils.timeToReferenceDate(new Date()))
  ).toBeLessThan(1);
  console.log(infoJson);
});
