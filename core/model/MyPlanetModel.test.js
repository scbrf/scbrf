jest.mock("fs");
jest.mock("../ipfs");
jest.mock("../Helper/TemplateStore", () => ({
  get: () => ({
    assetsPath: "",
    renderIndex() {},
  }),
}));
const MyPlanetModel = require("./MyPlanetModel");

test("create planet", async () => {
  const planet = await MyPlanetModel.create({
    name: "test",
    about: "about",
    templateName: "plain",
  });
  expect(planet.name).toBe("test");
  planet.save();
  await planet.savePublic();
});
