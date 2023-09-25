const DraftModel = require("../../model/DraftModel");
const MyArticleModel = require("../../model/MyArticleModel");

module.exports = async (params) => {
  const { draftID, articleID, title, content, tags } = params;
  let draft;
  if (articleID) {
    const article = MyArticleModel.fromID(articleID);
    if (article.draft) {
      draft = article.draft;
    } else {
      draft = DraftModel.create({ article });
    }
  } else {
    draft = DraftModel.fromID(draftID);
  }
  title && (draft.title = title);
  content && (draft.content = content);
  tags && (draft.tags = tags);
  draft.save();
  return draft;
};
