const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");
const Assignment = require("../models/Assignment");

router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json(assignments);
  } catch (err) {
    res.json({ message: error });
  }
});

router.delete("/nuclear", async (req, res) => {
  try {
    const deletedAssignment = await Assignment.deleteMany({});
    res.json(deletedAssignment);
  } catch (err) {
    res.json({ messaage: error });
  }
});

module.exports = router;
