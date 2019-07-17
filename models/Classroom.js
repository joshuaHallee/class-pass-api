const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({});

module.exports = mongoose.model("Classroom", classroomSchema);
