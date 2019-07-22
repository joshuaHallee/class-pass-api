const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  classroomId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: false
  },
  published: {
    type: Boolean,
    default: false
  },
  responses: [
    {
      studentId: {
        type: String
      },
      submissionDate: {
        type: Date,
        default: Date.now
      },
      submissionText: {
        type: String
      },
      modified: {
        type: Boolean,
        default: false,

        modifiedDate: {
          type: Date,
          default: Date.now
        }
      }
    }
  ],
  viewedBy: [
    {
      studentId: {
        type: String
      },
      viewDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  modified: {
    type: Boolean,
    default: false,

    modifiedDate: {
      type: Date,
      default: Date.now
    }
  }
});

module.exports = mongoose.model("Assignment", assignmentSchema);
