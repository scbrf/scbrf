class Ethers {
  getDefaultProvider() {
    return this;
  }
  getResolver() {
    return this;
  }
  getContentHash() {
    return this.contenthash;
  }
  getAvatar() {
    return this.avatar;
  }
  getAddress() {
    return this.address;
  }
}

module.exports = new Ethers();
