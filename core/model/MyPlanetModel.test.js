const mockfs = require("../__mocks__/fs");
jest.mock("fs", () => mockfs);
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
  expect(planet.template).toBeTruthy();
  planet.save();
  await planet.savePublic();
  const planetInfoJson = Object.keys(mockfs.fs).filter(
    (a) => a.endsWith("planet.json") && a.indexOf("My") >= 0
  )[0];
  console.log("*************", mockfs.fs);
  const infoJson = JSON.parse(mockfs.fs[planetInfoJson]);
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

  const planetPublicInfoJson = Object.keys(mockfs.fs).filter(
    (a) => a.endsWith("planet.json") && a.indexOf("Public") >= 0
  )[0];
  const publicInfoJson = JSON.parse(mockfs.fs[planetPublicInfoJson]);
  expect(
    Math.abs(publicInfoJson.created - utils.timeToReferenceDate(new Date()))
  ).toBeLessThan(1);
  expect(
    Math.abs(publicInfoJson.updated - utils.timeToReferenceDate(new Date()))
  ).toBeLessThan(1);

  const rssPath = Object.keys(mockfs.fs).filter(
    (a) => a.endsWith("rss.xml") && a.indexOf("Public") >= 0
  )[0];
  expect(mockfs.fs[rssPath]).toBeTruthy();
});
