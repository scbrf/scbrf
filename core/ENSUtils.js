class ENSUtils {
  async getCID(contenthash) {
    if (contenthash.toLowerCase().startsWith("ipns://")) {
      const ipns = contenthash.substring("ipns://".length);
      return await require("./ipfs").resolveIPNSorDNSLink(ipns);
    } else if (contenthash.toLowerCase().startsWith("ipfs://")) {
      return contenthash.substring("ipfs://".length);
    }
  }
  isIPNS(str) {
    if (!str.startsWith("k")) {
      return false;
    }
    const { decode } = require("@abcnews/base-36-text");
    const base36encoded = str.slice(1);
    const utf8EncodeText = new TextEncoder();
    const content = utf8EncodeText.encode(decode(base36encoded));
    return content[0] == 1 && content[1] == 0x72 && content[2] == 0;
  }
}

module.exports = new ENSUtils();
