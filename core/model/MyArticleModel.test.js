jest.mock("deasync", () => () => () => ({ duration: 1 }));
jest.mock("fs", () => ({
  mkdirSync() {},
  writeFileSync() {},
  existsSync() {},
  statSync: () => ({ size: 1 }),
}));
jest.mock("jimp", () => MockJimp);
jest.mock("../ipfs");
class MockJimp {
  static loadFont() {}
  print() {}
  writeAsync() {}
  static read() {
    return new MockJimp();
  }
  getWidth() {
    return 1;
  }
  getHeight() {
    return 1;
  }
  resize() {
    return this;
  }
}

const MyArticleModel = require("./MyArticleModel");
test("compose", async () => {
  const article = MyArticleModel.compose({
    title: "test",
    content: "this is a test",
    planet: {
      publicBasePath: "/",
      articlesPath: "/",
      template: {
        render() {
          return "123";
        },
      },
      hasVideoContent() {},
      ops: {},
    },
  });
  article.save();
  await article.savePublic();
});
