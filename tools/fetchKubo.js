async function fetchzip(path) {
  const rsp = await require("axios").get(
    "https://github.com/ipfs/kubo/releases/download/v0.15.0/kubo_v0.15.0_windows-amd64.zip",
    {
      responseType: "stream", // important
    }
  );
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
  zip.extractEntryTo(
    "kubo/ipfs.exe",
    require("path").join(__dirname, "..", "ipfsbin"),
    false,
    true
  );
}

run();
