let mockFs = {};
jest.mock("fs", () => ({
  existsSync: (path) => mockFs[path],
  mkdirSync: () => {},
  writeFileSync(path, cnt) {
    mockFs[path] = cnt;
  },
  readdirSync() {
    return [];
  },
}));
jest.mock("sharp");

const DraftModel = require("./DraftModel");
test("draft", async () => {
  mockFs = {};
  const draft = await DraftModel.create({ planet: { draftsPath: "/" } });
  draft.save();
  const infoPath = Object.keys(mockFs).filter((f) =>
    f.endsWith("Draft.json")
  )[0];
  const info = JSON.parse(mockFs[infoPath]);
  expect(!isNaN(info.date)).toBeTruthy();
});

test("draft from article", async () => {
  mockFs = {};
  const draft = await DraftModel.create({
    article: {
      created: new Date(),
      title: "test",
      planet: { articleDraftsPath: "/" },
    },
  });
  draft.save();
  const infoPath = Object.keys(mockFs).filter((f) =>
    f.endsWith("Draft.json")
  )[0];
  const info = JSON.parse(mockFs[infoPath]);
  expect(!isNaN(info.date)).toBeTruthy();
  expect(draft.title).toBe("test");
});
