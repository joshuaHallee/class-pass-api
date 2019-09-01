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
  const assignmentId = req.params.assignmentId,
    currentlyLoggedOnUserId = jwt.verify(
      req.headers["auth-token"],
      process.env.TOKEN_SECRET
    );

  let response = {
    studentId: currentlyLoggedOnUserId,
    submissionText: req.body.submissionText
  };

  Assignment.update(
    { _id: assignmentId },
    { $push: { responses: response } },
    (errors, raw) => {
      if (errors) console.log(errors);
      else res.json(raw);
    }
  );
});

router.post("/:classroomId", verify, async (req, res) => {
  const classroomId = req.params.classroomId;
  const title = req.body.title;
  const description = req.body.description;

  const assignment = new Assignment({
    classroomId: classroomId,
    title: title,
    description: description,
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

router.put("/grade/:assignmentId/for/:studentId", verify, async (req, res) => {
  const studentId = req.params.studentId;
  const assignmentId = req.params.assignmentId;
  console.log(req.body);
  const grade = req.body.grade;
  console.log(grade);

  try {
    let findAssignmentById = await Assignment.find({
      _id: req.params.assignmentId
    });

    console.log(findAssignmentById[0].responses);

    for (i = 0; i < findAssignmentById[0].responses.length; i++) {
      if (findAssignmentById[0].responses[i].studentId == studentId) {
        findAssignmentById[0].responses[i].score = grade;
      }
    }

    console.log(findAssignmentById[0].responses);

    Assignment.update(
      { _id: assignmentId },
      { ...findAssignmentById },
      (err, raw) => {
        if (err) res.json(err);
        else res.json(raw);
      }
    );
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
