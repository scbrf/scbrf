jest.mock("fs", () => ({
  writeFileSync(_, cnt) {
    this.fscnt = cnt;
  },
  readFileSync() {
    return Buffer.from(this.fscnt || "");
  },
}));
jest.mock("./log", () => () => ({ info: () => {}, error: () => {} }));
test("basic", async () => {
  const setting = require("./setting");
  await setting.init();
  expect(setting.get("a", 1)).toBe(1);
  await setting.set("a", 2);
  expect(setting.get("a")).toBe(2);
});
