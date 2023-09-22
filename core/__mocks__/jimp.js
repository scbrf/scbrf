class MockJimp {
  static loadFont() {}
  static read() {
    return new MockJimp();
  }
  print() {}
  writeAsync() {}
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
