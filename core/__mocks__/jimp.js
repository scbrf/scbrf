class MockJimp {
  static loadFont() {}
  static read(path) {
    const result = new MockJimp();
    result.source = path;
    return result;
  }
  print() {}
  writeAsync(path) {
    require("fs").writeFileSync(path, "__mock_cover__");
  }
  getWidth() {
    return 1;
  }
  getHeight() {
    return 1;
  }
  resize() {
    return this;
  }
}

module.exports = MockJimp;
