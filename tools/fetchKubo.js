async function fetchzip(path) {
  const target =
    require("os").platform() == "darwin"
      ? "https://github.com/ipfs/kubo/releases/download/v0.15.0/kubo_v0.15.0_darwin-arm64.tar.gz"
      : "https://github.com/ipfs/kubo/releases/download/v0.15.0/kubo_v0.15.0_windows-amd64.zip";

  console.log("need fetch", target);
  const rsp = await require("axios").get(target, {
    responseType: "stream", // important
  });
  await new Promise((resolve) => {
    rsp.data.pipe(require("fs").createWriteStream(path));
    rsp.data.on("close", () => {
      resolve();
    });
  });
}
async function run() {
  if (!require("fs").existsSync("./a.zip")) {
    await fetchzip("./a.zip");
  }
  const AdmZip = require("adm-zip");
  const zip = new AdmZip("./a.zip");
  //   var zipEntries = zip.getEntries();
  //   console.log(zipEntries.map((e) => e.entryName));
  const target =
    require("os").platform() == "darwin" ? "kubo/ipfs" : "kubo/ipfs.exe";
  console.log("need extract", target);
  zip.extractEntryTo(
    target,
    require("path").join(__dirname, "..", "ipfsbin"),
    false,
    true
  );
  console.log("done!");
}

run();
