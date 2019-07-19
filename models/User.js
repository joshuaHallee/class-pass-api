const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    first: { type: String, required: true },
    last: { type: String, required: true }
  },
  role: {
    isTeacher: { type: Boolean, required: true },
    isStudent: { type: Boolean, required: true },
    isParent: { type: Boolean, required: true }
  },
  email: { type: String, required: true },
  password: { type: String, required: true, max: 1024 },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
