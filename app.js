const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;
require("dotenv/config");

//Import Routes
const announcementRoute = require("./routes/announcement");
const assignmentRoute = require("./routes/assignment");
const classroomRoute = require("./routes/classroom");
const authRoute = require("./routes/auth");

//Middleware
app.use(bodyParser.json());
app.use("/api/announcement", announcementRoute);
app.use("/api/assignment", assignmentRoute);
app.use("/api/classroom", classroomRoute);
app.use("/api/user", authRoute);

mongoose.Promise = Promise;

//ROUTES
app.get("/", (req, res) => {
  res.send("good");
});

//Connect to DB
mongoose.connect(process.env.DB_CONNECTION_PROD, { useNewUrlParser: true }, () => {
  console.log("Connected to db");
});

app.listen(port, function() {
  console.log(`Server is listening on port ${port}`);
});
