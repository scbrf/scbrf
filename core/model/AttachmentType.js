class AttachmentType {
  static image = new AttachmentType();
  static video = new AttachmentType();
  static audio = new AttachmentType();
  static file = new AttachmentType();
  static supportedImageContentTypes = [
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/gif",
  ];
  static supportedAudioContentTypes = [
    "audio/aac",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
  ];
  static supportedVideoContentTypes = [
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/webm",
    "video/x-msvideo",
    "application/octet-stream",
  ];
  static from(path) {
    const mime = require("mime");
    const mime_type = mime.getType(path);
    return AttachmentType.fromContentType(mime_type);
  }
  static fromContentType(mime) {
    if (supportedImageContentTypes.indexOf(mime) >= 0)
      return AttachmentType.image;
    if (supportedAudioContentTypes.indexOf(mime) >= 0)
      return AttachmentType.audio;
    if (supportedVideoContentTypes.indexOf(mime) >= 0)
      return AttachmentType.video;
    return AttachmentType.file;
  }
  static fromName(type) {
    if (type == ".audio") return AttachmentType.audio;
    if (type == ".video") return AttachmentType.video;
    if (type == ".image") return AttachmentType.image;
    return AttachmentType.file;
  }
}

module.exports = AttachmentType;
