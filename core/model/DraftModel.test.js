const mockFs = {};
jest.mock("fs", () => ({
  existsSync: (path) => mockFs[path],
  mkdirSync: () => {},
  writeFileSync(path, cnt) {
    mockFs[path] = cnt;
  },
}));
jest.mock("sharp");

const DraftModel = require("./DraftModel");
test("draft", async () => {
  const draft = await DraftModel.create({ planet: { draftsPath: "/" } });
  draft.save();
  const infoPath = Object.keys(mockFs).filter((f) =>
    f.endsWith("Draft.json")
  )[0];
  const info = JSON.parse(mockFs[infoPath]);
  console.log(info);
  expect(!isNaN(info.date)).toBeTruthy();
});
