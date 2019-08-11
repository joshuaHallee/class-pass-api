const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");
const Assignment = require("../models/Assignment");
const Classroom = require("../models/Classroom");

router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json(assignments);
  } catch (err) {
    res.json({ message: error });
  }
});

router.put("/:classroomId", verify, async (req, res) => {
  const classroomId = req.params.classroomId;
  console.log(classroomId);

  const assignment = new Assignment({
    classroomId: classroomId,
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
    isPublished: req.body.isPublished,
    repsonses: [],
    viewedBy: []
  });

  try {
    const savedAssignment = await assignment.save();

    const updatedClassroomAssignment = await Classroom.updateOne(
      { _id: { $eq: classroomId } },
      {
        $push: {
          assignments: {
            assignmentId: savedAssignment._id
          }
        }
      }
    );

    res.json(updatedClassroomAssignment);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
