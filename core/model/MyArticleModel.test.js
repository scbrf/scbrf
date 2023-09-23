const mockfs = require("../__mocks__/fs");
jest.mock("fs", () => mockfs);
jest.mock("../ipfs");
jest.mock("node:child_process");
jest.mock("@ffmpeg-installer/ffmpeg", () => ({}));

const MyArticleModel = require("./MyArticleModel");
const planet = {
  publicBasePath: "/pub",
  articlesPath: "/articles",
  template: {
    render() {
      return "123";
    },
  },
  ops: {},
};
test("compose basic", async () => {
  mockfs.fs = {};
  const article = MyArticleModel.compose({
    title: "test",
    content: "this is a test",
    summary: "this is a test",
    created: new Date(),
    planet,
  });
  article.save();
  await article.savePublic();
  const infojsonPath = Object.keys(mockfs.fs).filter((a) =>
    a.startsWith("/articles/")
  )[0];
  const infojson = JSON.parse(mockfs.fs[infojsonPath]);
  expect(infojson.id).toBe(infojson.id.toUpperCase());
  expect(infojson.link).toBe(`/${infojson.id}/`);

  const pubinfojsonPath = Object.keys(mockfs.fs).filter((a) =>
    a.endsWith("article.json")
  )[0];
  const pubinfojson = JSON.parse(mockfs.fs[pubinfojsonPath]);
  expect(pubinfojson.link).toBe(`/${pubinfojson.id}/`);

  const pubmdPath = Object.keys(mockfs.fs).filter((a) =>
    a.endsWith("article.md")
  )[0];
  expect(mockfs.fs[pubmdPath]).toBe(`test\n\nthis is a test`);

  const coverPath = Object.keys(mockfs.fs).filter((a) =>
    a.endsWith("_cover.png")
  )[0];
  expect(coverPath).toBeTruthy();
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
