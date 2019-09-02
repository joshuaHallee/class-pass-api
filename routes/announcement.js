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

router.get("/:announcementId", verify, async (req, res) => {
  try {
    const findAnnouncementById = await Announcement.findOne({
      _id: req.params.announcementId
    });
    res.json(findAnnouncementById);
  } catch (err) {
    res.json(err);
  }
});

router.patch("/:announcementId", verify, async (req, res) => {
  const announcementId = req.params.announcementId;
  const title = req.body.title;
  const description = req.body.description;

  try {
    const updatedClassroomAnnouncement = await Announcement.updateOne(
      { _id: { $eq: announcementId } },
      {
        title: title,
        description: description
      }
    );
    res.json(updatedClassroomAnnouncement);
  } catch (err) {
    res.json(err);
  }
});

router.put("/:announcementId", verify, async (req, res) => {
  const announcementId = req.params.announcementId;
  const dateNow = new Date().getDate();
  let mods = {
    title: req.body.title,
    description: req.body.description,
    isPublished: req.body.isPublished,
    modifiedDate: Date.now(),
    isEdited: true
  };

  Announcement.update({ _id: announcementId }, mods, (errors, raw) => {
    if (errors) console.log(errors);
    else res.json(raw);
  });
});

router.post("/:classroomId", verify, async (req, res) => {
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
