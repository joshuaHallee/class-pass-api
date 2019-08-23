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

router.get("/:classroomId", verify, async (req, res) => {
  try {
    const findClassroomById = await Classroom.find({
      _id: req.params.classroomId
    });
    res.json(findClassroomById);
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
    var megaPayload = [];
    //gets currently signed in userId
    const currentlyLoggedOnUserId = jwt.verify(
      req.headers["auth-token"],
      process.env.TOKEN_SECRET
    );
    //just classroom Ids
    const studentClassroomsId = await User.find(
      { _id: currentlyLoggedOnUserId },
      { classrooms: 1 }
    );
    //classroom array parse
    studentClassroomIdArray = studentClassroomsId[0].classrooms.classroomId;
    //HARD DATA classrooms
    const findClassroomData = await Classroom.find({
      _id: { $in: studentClassroomIdArray }
    });
    //assignment array
    assignmentArray = [];
    for (i = 0; i < studentClassroomIdArray.length; i++) {
      for (j = 0; j < findClassroomData[i].assignments.length; j++) {
        assignmentArray.push(findClassroomData[i].assignments[j].assignmentId);
      }
    }
    //HARD DATA assignments
    const findClassroomAssignments = await Assignment.find({
      _id: { $in: assignmentArray }
    });

    //clean
    for (i = 0; i < studentClassroomIdArray.length; i++) {
      console.log("class " + i);
      megaPayload.push(findClassroomData[i]);
      megaPayload[i].teachers = [];
      megaPayload[i].announcements = [];
      megaPayload[i].students = [];
      for (j = 0; j < findClassroomData[i].assignments.length; j++) {
        console.log("assignment " + j);
      }
    }

    // megaPayload[0].assignments = [];
    // megaPayload[0].assignments.push("test");

    // Debugging
    console.log("_________________________________________________");
    console.log("Currently Sign in as: " + currentlyLoggedOnUserId._id);
    console.log(" ");
    console.log("These are my classrooms");
    console.log(studentClassroomIdArray);
    console.log(" ");
    console.log("These are my assignments");
    console.log(assignmentArray);
    console.log(" ");
    console.log("CLASSROOM DATA DUMP");
    console.log(findClassroomData);
    console.log(" ");
    console.log("ASSIGNMENT DATA DUMP");
    console.log(findClassroomAssignments);
    console.log(" ");

    res.json(megaPayload);
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
