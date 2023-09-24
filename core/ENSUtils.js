class ENSUtils {
  async getCID(contenthash) {
    if (contenthash.toLowerCase().startsWith("ipns://")) {
      const ipns = contenthash.substring("ipns://".length);
      return await require("./ipfs").resolveIPNSorDNSLink(ipns);
    } else if (contenthash.toLowerCase().startsWith("ipfs://")) {
      return contenthash.substring("ipfs://".length);
    }
  }
}

module.exports = new ENSUtils();
