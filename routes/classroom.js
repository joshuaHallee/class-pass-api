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

    res.json(studentIdToClassroom);
    res.json(classroomIdToStudent);

    // {
    //   "_id": "5d5091233d44a005b4425b86",
    //   "className": "Joshs Room",
    //   "createdBy": "5d508f4c3d44a005b4425b7d",
    //   "teachers": [],
    //   "assignments": [],
    //   "announcements": [
    //   ],
    //   "inviteCode": "GltLSqcMB",
    //   "creationDate": "2019-08-11T22:05:23.923Z",
    //   "students": []
    // }

    // const updatedClassroomAssignment = await Classroom.updateOne(
    //   { _id: { $eq: classroomId } },
    //   {
    //     $push: {
    //       assignments: {
    //         assignmentId: savedAssignment._id
    //       }
    //     }
    //   }
    // );
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
