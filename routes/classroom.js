const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verify = require("./verifyToken");
const Classroom = require("../models/Classroom");

router.get("/", verify, async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.json(classrooms);
  } catch (err) {
    res.json({ message: error });
  }
});

router.post("/", verify, async (req, res) => {
  const verified = jwt.verify(
    req.headers["auth-token"],
    process.env.TOKEN_SECRET
  );

  //data MUST be wrapped in [ ] to push to array as object
  var data = [];
  data.push(verified._id);

  const classroom = new Classroom({
    className: req.body.className,
    createdBy: verified._id,
    teachers: [data],
    assignments: [],
    announcements: []
  });

  console.log(classroom);

  try {
    const savedClassroom = await classroom.save();
    res.json(savedClassroom);
  } catch (err) {
    res.json(err);
  }
});

router.post("/:classroomId/assignment", verify, async (req, res) => {
  const verified = jwt.verify(
    req.headers["auth-token"],
    process.env.TOKEN_SECRET
  );

  console.log("MADE IT classroomID / Assignemnt");

  //data MUST be wrapped in [ ] to push to array as object
  // var data = [];
  // data.push(verified._id);

  // const classroom = new Classroom({
  //   className: req.body.className,
  //   createdBy: verified._id,
  //   teachers: [data],
  //   assignments: [],
  //   announcements: []
  // });

  // console.log(classroom);

  // try {
  //   const savedClassroom = await classroom.save();
  //   res.json(savedClassroom);
  // } catch (err) {
  //   res.json(err);
  // }
});

router.delete("/:classroomId", async (req, res) => {
  try {
    const deletedClassroom = await Classroom.deleteOne({
      _id: req.params.classroomId
    });
    res.json(deletedClassroom);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
