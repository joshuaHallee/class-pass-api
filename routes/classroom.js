const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");
const Classroom = require("../models/Classroom");

router.get("/", async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.json(classrooms + "returned classroom test");
  } catch (err) {
    res.json({ message: error });
  }
});

module.exports = router;
