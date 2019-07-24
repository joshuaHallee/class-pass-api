const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  classroomId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  creationDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: false },
  isPublished: { type: Boolean, default: false },
  responses: [
    {
      studentId: { type: String },
      submissionDate: { type: Date, default: Date.now },
      submissionText: { type: String },
      isEdited: { type: Boolean, default: false },
      modifiedDate: { type: Date, default: Date.now },
      score: { type: Float32Array, default: 0.0 }
    }
  ],
  viewedBy: [
    {
      studentId: { type: String },
      viewDate: { type: Date, default: Date.now }
    }
  ],
  isEdited: { type: Boolean, default: false },
  modifiedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Assignment", assignmentSchema);
