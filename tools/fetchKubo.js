async function fetchPackage() {
  const target =
    require("os").platform() == "darwin"
      ? "https://github.com/ipfs/kubo/releases/download/v0.15.0/kubo_v0.15.0_darwin-amd64.tar.gz"
      : "https://github.com/ipfs/kubo/releases/download/v0.15.0/kubo_v0.15.0_windows-amd64.zip";
  const localPath = require("path").join(
    __dirname,
    require("path").basename(target)
  );
  console.log("need fetch", target, "to", localPath);
  if (!require("fs").existsSync(localPath)) {
    const rsp = await require("axios").get(target, {
      responseType: "stream", // important
    });
    await new Promise((resolve) => {
      rsp.data.pipe(require("fs").createWriteStream(localPath));
      rsp.data.on("close", () => {
        resolve();
      });
    });
  }
  return localPath;
}
async function run() {
  const localPath = await fetchPackage();
  const entryPath =
    require("os").platform() == "darwin" ? "kubo/ipfs" : "kubo/ipfs.exe";
  const targetDir = require("path").join(__dirname, "..", "ipfsbin");
  const targetPath = require("path").join(
    targetDir,
    require("path").basename(entryPath)
  );
  if (localPath.endsWith(".zip")) {
    const AdmZip = require("adm-zip");
    const zip = new AdmZip("./a.zip");
    console.log("need extract", entryPath);
    zip.extractEntryTo(entryPath, targetDir, false, true);
  } else if (localPath.endsWith(".tar.gz")) {
    const tar = require("tar");
    await tar.x({
      file: localPath,
      filter: (path) => path === entryPath,
      cwd: __dirname,
    });
    if (!require("fs").existsSync(targetPath)) {
      require("fs").renameSync(
        require("path").join(__dirname, entryPath),
        targetPath
      );
    }
  }
  console.log("done!");
}

run();
