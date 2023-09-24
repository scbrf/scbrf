jest.mock("fs");
jest.mock("../ipfs", () => ({
  pin() {},
}));
jest.mock("../ENSUtils", () => ({
  getCID() {
    return "123";
  },
}));

const FollowingPlanetModel = require("./FollowingPlanetModel");
test("ens follow", async () => {
  require("ethers").contenthash = "ipns://abc";
  require("ethers").avatar = "http://123";
  global.fetch = () => ({
    json: () => ({
      name: "test",
      articles: [],
    }),
  });
  await FollowingPlanetModel.follow("planetable.eth");
});
