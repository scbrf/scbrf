jest.mock("fs");
jest.mock("../ipfs");

const FollowingArticleModel = require("./FollowingArticleModel");
const PlanetType = require("./PlanetType");
test("follow article", async () => {
  const article = await FollowingArticleModel.from(
    {
      name: "test",
      content: "this is a test",
      link: "/a",
    },
    { planetType: PlanetType.ens }
  );
  expect(article.summary).toBeTruthy();
});
