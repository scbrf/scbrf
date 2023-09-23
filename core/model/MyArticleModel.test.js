const mockfs = require("../__mocks__/fs");
jest.mock("fs", () => mockfs);
jest.mock("../ipfs");
jest.mock("node:child_process");
jest.mock("@ffmpeg-installer/ffmpeg", () => ({}));

const MyArticleModel = require("./MyArticleModel");
const planet = {
  publicBasePath: "/",
  articlesPath: "/",
  template: {
    render() {
      return "123";
    },
  },
  ops: {},
};
test("compose basic", async () => {
  const article = MyArticleModel.compose({
    title: "test",
    content: "this is a test",
    planet,
  });
  article.save();
  await article.savePublic();
});

test("compose audio", async () => {
  const article = MyArticleModel.compose({
    title: "test",
    content: "this is a test",
    planet,
  });
  article.attachments = ["a.mp3"];
  article.audioFilename = "a.mp3";
  await article.savePublic();
});

test("compose video", async () => {
  const article = MyArticleModel.compose({
    title: "test",
    content: "this is a test",
    planet,
  });
  article.attachments = ["a.mp4"];
  article.videoFilename = "a.mp4";
  await article.savePublic();
});
