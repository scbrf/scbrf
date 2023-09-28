const ENSUtils = require("./ENSUtils");
test("isIPNS", () => {
  expect(
    ENSUtils.isIPNS(
      "k51qzi5uqu5dit2o1lwoknd80bxx0dgifetl1tyrvlsl1w6qo1236zf4agu3r8"
    )
  ).toBeTruthy();
  expect(ENSUtils.isIPNS("k51qz")).toBeFalsy();
});
