const AttachmentType = require("../../model/AttachmentType");
const DraftModel = require("../../model/DraftModel");

module.exports = async (params) => {
  const { draftID, path, type } = params;
  const draft = DraftModel.fromID(draftID);
  await draft.addAttachment(path, AttachmentType.fromName(type));
  draft.renderPreview();
  draft.save();
  return draft;
};
