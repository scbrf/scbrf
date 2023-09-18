jest.mock("../log", () => () => ({ info: () => {}, error: () => {} }));
const planetTemplates = require("./PlanetSiteTemplates");
test("buildin template", () => {
  expect(planetTemplates.builtInTemplates.length).toBe(4);
  expect(planetTemplates.builtInTemplates[0].id).toBe(
    planetTemplates.builtInTemplates[0].name
  );
});
