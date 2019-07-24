const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  classroomId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  creationDate: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  modifiedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Announcement", announcementSchema);
