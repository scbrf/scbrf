jest.mock("fs");
jest.mock("../ipfs", () => ({
  pin() {},
  resolveIPNSorDNSLink() {
    return "123";
  },
}));
jest.mock("../ENSUtils", () => ({
  getCID() {
    return "123";
  },
}));

const FollowingPlanetModel = require("./FollowingPlanetModel");
test("ens follow planet", async () => {
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

test("ens follow rss", async () => {
  require("ethers").contenthash = "ipns://abc";
  require("ethers").avatar = "http://123";
  global.fetch = () => ({
    json: () => ({
      name: "test",
      articles: [],
    }),
  });
  await FollowingPlanetModel.follow("vitalik.eth");
});
