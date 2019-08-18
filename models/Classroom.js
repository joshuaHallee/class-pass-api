const mongoose = require("mongoose");
const shortid = require("shortid");
//
const classroomSchema = new mongoose.Schema({
  inviteCode: { type: String, default: shortid.generate },
  className: { type: String, required: true },
  createdBy: { type: String, required: true },
  creationDate: { type: Date, default: Date.now },
  students: [
    {
      studentId: { type: String },
      grade: { type: Number, default: -1 },
      joinDate: { type: Date, default: Date.now }
    }
  ],
  teachers: [
    {
      teacherId: { type: String }
    }
  ],

  assignments: [
    {
      assignmentId: { type: String }
    }
  ],
  announcements: [
    {
      announcementId: { type: String }
    }
  ]
});

module.exports = mongoose.model("Classroom", classroomSchema);
