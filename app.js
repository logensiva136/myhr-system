const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const ejs = require("ejs");
const path = require("path");
require('dotenv').config()
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "views", "public")));

app.use(bodyParser.urlencoded({
  extended: true
}));

const devRouter = require("./routes/dev");
const userRouter = require("./routes/user");

app.use("/", userRouter);

// app.use("/dev",devRouter);

app.use((req, res) => {
  res.render("404")
});

app.listen(12345, (req, res, next) => {
  console.log("Listening : http://localhost:12345");
});