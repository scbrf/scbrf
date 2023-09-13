jest.mock("./cmds", () => ({
  abcF: () => 5,
}));
jest.mock("./setting");
jest.mock("./ipfs");

test("prototype", () => {
  const core = require("./index");
  expect(core.abcF()).toBe(5);
});
