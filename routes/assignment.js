const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");
const jwt = require("jsonwebtoken");
const Assignment = require("../models/Assignment");
const Classroom = require("../models/Classroom");

router.get("/", verify, async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json(assignments);
  } catch (err) {
    res.json({ message: error });
  }
});

router.get("/:assignmentId", verify, async (req, res) => {
  try {
    const findAssignmentById = await Assignment.find({
      _id: req.params.assignmentId
    });
    res.json(findAssignmentById);
  } catch (err) {
    res.json(err);
  }
});

router.put("/do/:assignmentId/", verify, async (req, res) => {
  const assignmentId = req.params.assignmentId
      , currentlyLoggedOnUserId = jwt.verify(req.headers["auth-token"], process.env.TOKEN_SECRET);

  let response = {
    studentId: currentlyLoggedOnUserId,
    submissionText: req.body.submissionText
  }

  Assignment.update({_id: assignmentId}, {$push: {responses: response}}, (errors, raw) => {
    if(errors) console.log(errors);
    else res.json(raw);
  })
});

router.post("/:classroomId", verify, async (req, res) => {
  const classroomId = req.params.classroomId;
  console.log(classroomId);

  const assignment = new Assignment({
    classroomId: classroomId,
    responses: []
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

router.delete("/:assignmentId", verify, async (req, res) => {
  try {
    const deletedAssignment = await Classroom.update(
      {},
      {
        $pull: { assignments: { assignmentId: req.params.assignmentId } }
      },
      { multi: true }
    );
    res.json(deletedAssignment);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
