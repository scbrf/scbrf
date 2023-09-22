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
  rmSync() {},
}));
jest.mock("../ipfs");
jest.mock("./MyArticleModel", () => MockArticle);
class MockArticle {
  constructor(json) {
    Object.assign(this, json);
  }
  getCIDs() {
    return [];
  }
  save() {}
  savePublic() {}
  static compose(json) {
    return new MockArticle(json);
  }
}

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
  expect(draft.id).toBe(draft.id.toUpperCase());
});

test("draft 2 article", async () => {
  mockFs = {};
  const draft = await DraftModel.create({
    planet: {
      draftsPath: "/",
      publicBasePath: "/",
      articlesPath: "/",
      articles: [],
      drafts: [],
      copyTemplateAssets() {},
      save() {},
      savePublic() {},
      publish() {},
    },
  });
  draft.title = "test";
  draft.content = "this is a test";
  await draft.saveToArticle();
});
