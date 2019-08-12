const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");
const Announcement = require("../models/Announcement");
const Classroom = require("../models/Classroom");

router.get("/", verify, async (req, res) => {
  try {
    const announcments = await Announcement.find();
    res.json(announcments);
  } catch (err) {
    res.json({ message: error });
  }
});

router.put("/:classroomId", verify, async (req, res) => {
  const classroomId = req.params.classroomId;
  console.log(classroomId);

  const announcement = new Announcement({
    classroomId: classroomId,
    title: req.body.title,
    description: req.body.description,
    isPublished: req.body.isPublished
  });

  console.log(announcement);

  try {
    const savedAnnouncement = await announcement.save();

    const updatedClassroomAnnouncement = await Classroom.updateOne(
      { _id: { $eq: classroomId } },
      {
        $push: {
          announcements: {
            announcementId: savedAnnouncement._id
          }
        }
      }
    );

    res.json(updatedClassroomAnnouncement);
  } catch (err) {
    res.json(err);
  }
});

router.delete("/:announcementId", verify, async (req, res) => {
  try {
    const deletedAnnouncement = await Classroom.update(
      {},
      {
        $pull: { announcements: { announcementId: req.params.announcementId } }
      },
      { multi: true }
    );
    res.json(deletedAnnouncement);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
