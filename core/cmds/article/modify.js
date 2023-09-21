const DraftModel = require("../../model/DraftModel");

module.exports = async (params) => {
  const { draftID, articleID, title, content, tags } = params;
  if (articleID) {
    // TODO, create draft on fly
  }
  let draft = DraftModel.fromID(draftID);
  title && (draft.title = title);
  content && (draft.content = content);
  tags && (draft.tags = tags);
  draft.save();
  return draft;
};
