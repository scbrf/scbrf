class ArticleType {
  value = -1;
  constructor(value) {
    this.value = value;
  }
  static blog = new ArticleType(0);
  toJSON() {
    return this.value;
  }
}

module.exports = ArticleType;
