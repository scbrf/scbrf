module.exports = async (params) => {
  return await require("../../model/WriterStore").newArticle(params);
};
