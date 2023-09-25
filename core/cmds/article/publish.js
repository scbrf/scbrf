const DraftModel = require("../../model/DraftModel");

module.exports = async (params) => {
  const { draftID } = params;
  const draft = DraftModel.fromID(draftID);
  const article = await draft.saveToArticle();
  return article;
};
