const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");
const Assignment = require("../models/Assignment");

router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json(assignments + "returned assignment test");
  } catch (err) {
    res.json({ message: error });
  }
});

module.exports = router;
