const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const https = require('https');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;
require("dotenv/config");
var key = fs.readFileSync(__dirname + '/selfsigned.key');
var cert = fs.readFileSync(__dirname + '/selfsigned.crt');
var options = {
    key: key,
    cert: cert
};

var whitelist = ['http://example1.com', 'http://example2.com']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};
var whitelist = ['https://master.djujr8vlrqdzn.amplifyapp.com', 'http://classpass.tech', 'https://classpass.tech']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
//Import Routes
const announcementRoute = require("./routes/announcement");
const assignmentRoute = require("./routes/assignment");
const classroomRoute = require("./routes/classroom");
const authRoute = require("./routes/auth");

app.use(cors(corsOptions));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//f
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

var server = https.createServer(options, app);

server.listen(port, () => {
    console.log("server starting on port : " + port)
});