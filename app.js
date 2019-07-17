const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
require("dotenv/config");

//Import Routes
const authRoute = require("./routes/auth");
const postsRoute = require("./routes/posts");

//Middleware
app.use(bodyParser.json());
app.use("/api/user", authRoute);
app.use("/api/posts", postsRoute);

//ROUTES
app.get("/", (req, res) => {
  res.send("good");
});

//Connect to DB
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () => {
  console.log("Connected to db");
});

app.listen(port, function() {
  console.log(`Server is listening on port ${port}`);
});
