class Pinnable {
  api = "";
  constructor(api) {
    this.api = api;
  }
  async pin() {
    const url = `${this.api}`;
    await fetch(url);
  }
}

module.exports = Pinnable;
