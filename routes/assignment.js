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
  const grade = req.body.grade;

  try {
    //Grade assignment
    let findAssignmentById = await Assignment.find({
      _id: req.params.assignmentId
    });
    //Change score for student response
    for (i = 0; i < findAssignmentById[0].responses.length; i++) {
      if (findAssignmentById[0].responses[i].studentId == studentId) {
        findAssignmentById[0].responses[i].score = grade;
      }
    }
    //Update assignment in mongo
    Assignment.findOneAndUpdate(
      { _id: assignmentId },
      { responses: findAssignmentById[0].responses },
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (errors, raw) => {
        if (errors) console.log(errors);
        else res.json(raw);
      }
    );

    //Average all assignments together and update Class grade for student

    let average = 0;
    let count = 0;

    try {
      //findClassroom
      let findClassById = await Classroom.findOne({
        _id: findAssignmentById[0].classroomId
      });
      //Loop through assignments
      for (i = 0; i < findClassById.assignments.length; i++) {
        try {
          //Find assignment
          let thisAssignment = await Assignment.findOne({
            _id: findClassById.assignments[i].assignmentId
          });
          //Loop through responses looking for the student that is being graded
          for (k = 0; k < thisAssignment.responses.length; k++) {
            if (thisAssignment.responses[k].studentId == studentId) {
              average += thisAssignment.responses[k].score;
              count++;
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
      //Average each grade
      average /= count;

      //Update student grade for Classroom with the new average

      for (i = 0; i < findClassById.students.length; i++) {
        if (findClassById.students[i].studentId == studentId) {
          findClassById.students[i].grade = average;
        }
      }

      Classroom.findOneAndUpdate(
        { _id: findClassById._id },
        { students: findClassById.students },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (errors, raw) => {
          if (errors) console.log(errors);
          else console.log(raw);
        }
      );
    } catch (err) {
      console.log(err);
    }
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
