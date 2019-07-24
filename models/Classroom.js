const mongoose = require("mongoose");
//
const classroomSchema = new mongoose.Schema({
  className: { type: String, required: true },
  creationDate: { type: Date, default: Date.now },
  students: [
    {
      studentId: { type: String },
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
