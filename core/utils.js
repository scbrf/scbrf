const which = require("which");
const { Readable } = require("stream");
class ReadableString extends Readable {
  sent = false;

  constructor(str) {
    super();
    this.str = str;
  }
  _read() {
    if (!this.sent) {
      this.push(Buffer.from(this.str));
      this.sent = true;
    } else {
      this.push(null);
    }
  }
}
class Executables {
  ipfs;
  ffmpeg;
  ffprobe;
  constructor() {
    this.init();
  }
  async init() {
    let path = await which("ipfs", { nothrow: true });
    if (!path) {
      path = require("path").join(__dirname, "..", "executables", "ipfs");
    }
    if (require("fs").existsSync(path)) this.ipfs = path;
    path = await which("ffmpeg", { nothrow: true });
    if (!path) {
      path = require("path").join(__dirname, "..", "executables", "ffmpeg");
    }
    if (require("fs").existsSync(path)) this.ffmpeg = path;
    path = await which("ffprobe", { nothrow: true });
    if (!path) {
      path = require("path").join(__dirname, "..", "executables", "ffprobe");
    }
    if (require("fs").existsSync(path)) this.ffprobe = path;
  }
}

function exportJS(base, path) {
  base = require("path").join(base, path);
  const baseName = base.split(require("path").sep).slice(-1)[0];
  return require("fs")
    .readdirSync(base)
    .reduce((r, i) => {
      const name = i.slice(0, -3);
      r[
        `${baseName}${name[0].toUpperCase()}${name.slice(1)}`
      ] = require(`${base}/${i}`);
      return r;
    }, {});
}

async function getPortRange(from, to) {
  const { default: getPort, portNumbers } = await import("get-port");
  return await getPort({ port: portNumbers(from, to) });
}

module.exports = {
  exportJS,
  getPortRange,
  timeFromReferenceDate(v) {
    const ReferenceDate = new Date("2001-01-01").getTime();
    return new Date(Math.round(v * 1000 + ReferenceDate));
  },
  timeToReferenceDate(v) {
    const ReferenceDate = new Date("2001-01-01").getTime();
    return (v.getTime() - ReferenceDate) / 1000.0;
  },
  sha256(str) {
    const { createHash } = require("node:crypto");
    return createHash("sha256").update(str).digest("hex");
  },
  exe: new Executables(),
  ReadableString,
};
