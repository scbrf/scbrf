const mockFs = {};
jest.mock("fs", () => ({
  existsSync: (path) => mockFs[path],
  mkdirSync: () => {},
}));
jest.mock("./log", () => () => ({ info: () => {}, error: () => {} }));
jest.mock("node:child_process", () => ({
  execFile: (e, p, opt, cb) => {
    cb(null, "", "");
  },
  spawn: () => ({ stdout: { on: () => {} } }),
}));
jest.mock("./utils", () => ({
  getPortRange: () => 10000,
}));
global.setInterval = () => {};
require("./setting").prefs = {};
const ipfs = require("./ipfs");
test("ipfs init", async () => {
  const ipfs_exe_path = require("path").join(
    __dirname,
    "go-ipfs-executables",
    "ipfs-amd64-0.15.bin"
  );
  mockFs[ipfs_exe_path] = true;
  await ipfs.init();
});