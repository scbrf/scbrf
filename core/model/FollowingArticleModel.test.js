jest.mock("fs");
jest.mock("../ipfs");

const FollowingArticleModel = require("./FollowingArticleModel");
test("follow article", async () => {
  const article = await FollowingArticleModel.from(
    {
      name: "test",
      content: "this is a test",
      link: "/a",
    },
    {}
  );
});
