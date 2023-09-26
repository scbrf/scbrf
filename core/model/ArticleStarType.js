class ArticleStarType {
  value = -1;
  static star = new ArticleStarType(0);
  constructor(value) {
    this.value = value;
  }
  toJSON() {
    return this.value;
  }
}

module.exports = ArticleStarType;
