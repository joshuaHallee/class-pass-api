const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verify = require("./verifyToken");
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

// router.put("/:classroomId/assignment", verify, async (req, res) => {
//   const classroomId = req.params.classroomId;
//   console.log(classroomId);

//   const assignment = new Assignment({
//     classroomId: classroomId,
//     title: req.body.title,
//     description: req.body.description,
//     dueDate: req.body.dueDate,
//     isPublished: req.body.isPublished,
//     repsonses: [],
//     viewedBy: []
//   });

//   try {
//     const savedAssignment = await assignment.save();

//     const updatedClassroomAssignment = await Classroom.updateOne(
//       { _id: { $eq: classroomId } },
//       {
//         $push: {
//           assignments: {
//             assignmentId: savedAssignment._id
//           }
//         }
//       }
//     );

//     res.json(updatedClassroomAssignment);
//   } catch (err) {
//     res.json(err);
//   }
// });

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
