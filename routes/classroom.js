const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verify = require("./verifyToken");
const User = require("../models/User");
const Classroom = require("../models/Classroom");
const Assignment = require("../models/Assignment");
const Announcement = require("../models/Announcement");
const async = require("async");

router.get("/", verify, async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.json(classrooms);
  } catch (err) {
    res.json({ message: error });
  }
});

router.post("/", verify, async (req, res) => {
  const currentlyLoggedOnUserId = jwt.verify(
    req.headers["auth-token"],
    process.env.TOKEN_SECRET
  );

  const classroom = new Classroom({
    className: req.body.className,
    createdBy: currentlyLoggedOnUserId._id,
    teachers: {
      teacherId: currentlyLoggedOnUserId._id
    },
    assignments: [],
    announcements: []
  });

  const classroomIdToStudent = await User.updateOne(
    { _id: { $eq: currentlyLoggedOnUserId } },
    {
      $push: {
        classrooms: {
          classroomId: classroom._id
        }
      }
    }
  );

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
    let studentClassroomIdArray = studentClassroomsId[0].classrooms.classroomId;
    //HARD DATA classrooms
    const findClassroomData = await Classroom.findOne({
      _id: req.params.classroomId
    });

    let ultraMegaPayload = {
      className: findClassroomData.className,
      classroomId: req.params.classroomId,
      assignments: [],
      announcements: []
    };

    for (k = 0; k < findClassroomData.assignments.length; k++) {
      try {
        console.log("assignment: " + k);

        const myAssignment = await Assignment.findOne({
          _id: { _id: findClassroomData.assignments[k].assignmentId }
        });
        ultraMegaPayload.assignments.push(myAssignment);
      } catch (err) {
        console.log(err);
      }
    }
    for (k = 0; k < findClassroomData.announcements.length; k++) {
      try {
        console.log("announcement: " + k);

        const myAnnouncement = await Announcement.findOne({
          _id: { _id: findClassroomData.announcements[k].announcementId }
        });
        ultraMegaPayload.announcements.push(myAnnouncement);
      } catch (err) {
        console.log(err);
      }
    }
    console.log(ultraMegaPayload);
    res.json(ultraMegaPayload);
  } catch (err) {
    res.json(err);
  }
});

router.get("/perStudent/classrooms", verify, async (req, res) => {
  try {
    //gets currently signed in userID
    const currentlyLoggedOnUserId = jwt.verify(
      req.headers["auth-token"],
      process.env.TOKEN_SECRET
    );
    //returns all user classroomIds
    const studentClassrooms = await User.find(
      {
        _id: currentlyLoggedOnUserId._id
      },
      { classrooms: 1 }
    );
    //cleaned to actual array
    const studentClassroomArray = studentClassrooms[0].classrooms.classroomId;
    //looks up actual classroom info using cleaned array
    const returnAllClassroomInfo = await Classroom.find({
      _id: { $in: studentClassroomArray }
    });
    res.json(returnAllClassroomInfo);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

router.get("/perStudent/assignments", verify, (req, res) => {
  try {
    let classroomsPayload = [];
    let classPay = [];
    //gets currently signed in userId
    const currentlyLoggedOnUserId = jwt.verify(
      req.headers["auth-token"],
      process.env.TOKEN_SECRET
    );
    async.waterfall(
      [
        callback => {
          User.findOne(
            { _id: currentlyLoggedOnUserId },
            { classrooms: 1 },
            (err, user) => {
              if (err) res.json(err);
              else {
                let classroomIds = user.classrooms.classroomId;
                callback(null, classroomIds);
              }
            }
          );
        },
        (classroomIds, callback) => {
          Classroom.find({ _id: { $in: classroomIds } }, (err, classrooms) => {
            if (err) res.json(err);
            else {
              let classroomsRaw = [...classrooms];
              classroomsRaw.forEach((cl, clI, arr) => {
                let assIds = cl.assignments.map(a => a.assignmentId);
                classroomsPayload.push({
                  className: cl.className,
                  classroomId: cl._id,
                  assignments: [],
                  assignmentIds: [...assIds]
                });
              });
              callback(null);
            }
          });
        },
        callback => {
          async.forEachOf(
            classroomsPayload,
            (classroom, key, callback) => {
              Assignment.find(
                { _id: { $in: classroom.assignmentIds } },
                (err, asses) => {
                  if (err) callback(err);
                  else {
                    let classroomStore = { ...classroom };
                    classroomStore.assignments = [...asses];
                    classPay.push(classroomStore);
                    callback();
                  }
                }
              );
            },
            err => {
              if (err) callback(err);
              else {
                callback(null, classPay);
              }
            }
          );
        }
      ],
      (error, classPay) => {
        if (error) res.json(error);
        else {
          let assignmentsReturned = [];
          classPay.forEach(cl => {
            cl.assignments.forEach(as => {
              assignmentsReturned.push({
                className: cl.className,
                ...as._doc
              });
            });
          });
          res.json(assignmentsReturned);
        }
      }
    );
  } catch (err) {
    res.json(err);
  }
});

router.get("/perStudent/announcements", verify, (req, res) => {
  try {
    let classroomsPayload = [];
    let classPay = [];
    //gets currently signed in userId
    const currentlyLoggedOnUserId = jwt.verify(
      req.headers["auth-token"],
      process.env.TOKEN_SECRET
    );
    async.waterfall(
      [
        callback => {
          User.findOne(
            { _id: currentlyLoggedOnUserId },
            { classrooms: 1 },
            (err, user) => {
              if (err) res.json(err);
              else {
                let classroomIds = user.classrooms.classroomId;
                callback(null, classroomIds);
              }
            }
          );
        },
        (classroomIds, callback) => {
          Classroom.find({ _id: { $in: classroomIds } }, (err, classrooms) => {
            if (err) res.json(err);
            else {
              let classroomsRaw = [...classrooms];
              classroomsRaw.forEach((cl, clI, arr) => {
                let assIds = cl.announcements.map(a => a.announcementId);
                classroomsPayload.push({
                  className: cl.className,
                  classroomId: cl._id,
                  announcements: [],
                  announcementIds: [...assIds]
                });
              });
              callback(null);
            }
          });
        },
        callback => {
          async.forEachOf(
            classroomsPayload,
            (classroom, key, callback) => {
              Announcement.find(
                { _id: { $in: classroom.announcementIds } },
                (err, asses) => {
                  if (err) callback(err);
                  else {
                    let classroomStore = { ...classroom };
                    classroomStore.announcements = [...asses];
                    classPay.push(classroomStore);
                    callback();
                  }
                }
              );
            },
            err => {
              if (err) callback(err);
              else {
                callback(null, classPay);
              }
            }
          );
        }
      ],
      (error, classPay) => {
        if (error) res.json(error);
        else {
          let announcementsReturned = [];
          classPay.forEach(cl => {
            cl.announcements.forEach(as => {
              announcementsReturned.push({
                className: cl.className,
                ...as._doc
              });
            });
          });
          res.json(announcementsReturned);
        }
      }
    );
  } catch (err) {
    res.json(err);
  }
});

router.get("/perTeacher/responses", verify, (req, res) => {
  try {
    let classroomsPayload = [];
    let classPay = [];
    //gets currently signed in userId
    const currentlyLoggedOnUserId = jwt.verify(
      req.headers["auth-token"],
      process.env.TOKEN_SECRET
    );
    async.waterfall(
      [
        callback => {
          User.findOne(
            { _id: currentlyLoggedOnUserId },
            { classrooms: 1 },
            (err, user) => {
              if (err) res.json(err);
              else {
                let classroomIds = user.classrooms.classroomId;
                callback(null, classroomIds);
              }
            }
          );
        },
        (classroomIds, callback) => {
          Classroom.find({ _id: { $in: classroomIds } }, (err, classrooms) => {
            if (err) res.json(err);
            else {
              let classroomsRaw = [...classrooms];
              classroomsRaw.forEach((cl, clI, arr) => {
                let assIds = cl.assignments.map(a => a.assignmentId);
                classroomsPayload.push({
                  className: cl.className,
                  classroomId: cl._id,
                  assignments: [],
                  assignmentIds: [...assIds]
                });
              });
              callback(null);
            }
          });
        },
        callback => {
          async.forEachOf(
            classroomsPayload,
            (classroom, key, callback) => {
              Assignment.find(
                { _id: { $in: classroom.assignmentIds } },
                (err, asses) => {
                  if (err) callback(err);
                  else {
                    let classroomStore = { ...classroom };
                    classroomStore.assignments = [...asses];
                    classPay.push(classroomStore);
                    callback();
                  }
                }
              );
            },
            err => {
              if (err) callback(err);
              else {
                callback(null, classPay);
              }
            }
          );
        }
      ],
      (error, classPay) => {
        if (error) res.json(error);
        else {
          let assignmentsReturned = [];
          classPay.forEach(cl => {
            cl.assignments.forEach(as => {
              assignmentsReturned.push({
                className: cl.className,
                ...as._doc
              });
            });
          });
          res.json(assignmentsReturned);
        }
      }
    );
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
