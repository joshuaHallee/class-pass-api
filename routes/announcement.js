const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");
const Announcement = require("../models/Announcement");

router.get("/", async (req, res) => {
  try {
    const announcments = await Announcement.find();
    res.json(announcments + "returned announcement test");
  } catch (err) {
    res.json({ message: error });
  }
});

module.exports = router;
