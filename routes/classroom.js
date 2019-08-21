const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verify = require("./verifyToken");
const User = require("../models/User");
const Classroom = require("../models/Classroom");
const Assignment = require("../models/Assignment");

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

  const classroom = new Classroom({
    className: req.body.className,
    createdBy: verified._id,
    teachers: {
      teacherId: verified._id
    },
    assignments: [],
    announcements: []
  });

  try {
    const savedClassroom = await classroom.save();
    res.json(savedClassroom);
  } catch (err) {
    res.json(err);
  }
});

router.post("/join/:shortId", verify, async (req, res) => {
  try {
    //gets UserID
    const currentlyLoggedOnUserId = jwt.verify(
      req.headers["auth-token"],
      process.env.TOKEN_SECRET
    );

    //gets ClassroomID from shortID
    const targetClassroom = await Classroom.findOne({
      inviteCode: { $eq: req.params.shortId }
    });
    const longClassroomId = targetClassroom._id;

    //insert StudentID into classroom students[] array
    const studentIdToClassroom = await Classroom.updateOne(
      { _id: { $eq: longClassroomId } },
      {
        $push: {
          students: {
            studentId: currentlyLoggedOnUserId
          }
        }
      }
    );

    //insert classroomId into student classrooms[] array
    const classroomIdToStudent = await User.updateOne(
      { _id: { $eq: currentlyLoggedOnUserId } },
      {
        $push: {
          classrooms: {
            classroomId: longClassroomId
          }
        }
      }
    );
    res.status(200).json(longClassroomId);
  } catch (err) {
    res.json(err);
  }
});

router.get("/classrooms", verify, async (req, res) => {
  try {
    //gets currently signed in userID
    const currentlyLoggedOnUserId = jwt.verify(
      req.headers["auth-token"],
      process.env.TOKEN_SECRET
    );
    //returns all userclassroom
    const studentClassrooms = await User.find(
      {
        _id: currentlyLoggedOnUserId
      },
      { classrooms: 1 }
    );
    //cleaned to actual array
    const studentClassroomArray = studentClassrooms[0].classrooms.classroomId;

    const returnAllClassroomInfo = await Classroom.find({
      _id: { $in: studentClassroomArray }
    });
    res.json(returnAllClassroomInfo);
  } catch (err) {
    res.json(err);
  }
});

router.get("/classrooms/assignments", verify, async (req, res) => {
  try {
    //gets currently signed in userID
    const currentlyLoggedOnUserId = jwt.verify(
      req.headers["auth-token"],
      process.env.TOKEN_SECRET
    );
    //returns all userclassroom
    const studentClassrooms = await User.find(
      {
        _id: currentlyLoggedOnUserId
      },
      { classrooms: 1 }
    );
    //cleaned to actual array
    const studentClassroomArray = studentClassrooms[0].classrooms.classroomId;

    const classroomAssignments = await Classroom.find(
      {
        _id: { $in: studentClassroomArray }
      },
      { assignments: 1 }
    );

    var array = {};

    classroomAssignments.forEach(function(element) {
      console.log(element.assignments[0].assignmentId);
    });

    //cleaned assignments array
    // totalNumOfAssignments = classroomAssignments.length;
    // listOfAssignments = {};

    // studentAssignmentsArray.foreach(function(element) {
    //   listOfAssignments.push(classroomAssignments.assignmenId);
    // });
    //studentAssignmentsArray = classroomAssignments.length;

    res.json("Work In Progress");
  } catch (err) {
    res.json(err);
  }
});

router.delete("/:classroomId", verify, async (req, res) => {
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
