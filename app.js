const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs");
const http = require("http");
const https = require("https");
const app = express();
const port = 3000;
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
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () => {
  console.log("Connected to db");
});

let privateKey  = fs.readFileSync(`${__dirname}/server.key`, 'utf8');
let certificate = fs.readFileSync(`${__dirname}/server.crt`, 'utf8');
let credentials = {key: privateKey, cert: certificate};
let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);

httpServer.listen(3000);
httpsServer.listen(3443);
// app.listen(port, function() {
//   console.log(`Server is listening on port ${port}`);
// });
