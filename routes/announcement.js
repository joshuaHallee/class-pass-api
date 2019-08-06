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

router.put("/:classroomId", verify, async (req, res) => {
  const classroomId = req.params.classroomId;
  console.log(classroomId);

  const announcement = new Announcement({
    classroomId: classroomId,
    title: req.body.title,
    description: req.body.description,
    isPublished: req.body.isPublished
  });

  try {
    const savedAnnouncement = await announcement.save();

    const updatedClassroomAnnouncement = await Classroom.updateOne(
      { _id: { $eq: classroomId } },
      {
        $push: {
          announcments: {
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

module.exports = router;
