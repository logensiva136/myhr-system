const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const ejs = require("ejs");
const path = require("path");
const session = require('express-session');
const cookieParser = require("cookie-parser");
require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 100;

const app = express();

// app.use(cookieParser());
app.use(session({
  secret: process.env.COOKIE_SECRET,
  saveUninitialized: true,
  resave: false,
  // cookie: {
  //   maxAge: 3600000
  // }
}));

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "views", "public")));

// app.use((req,res)=>console.log("triggered"))

app.use(bodyParser.urlencoded({
  extended: true
}));

const userRouter = require("./routes/user");
const { listeners } = require("process");

app.use("/", userRouter);

app.use((req, res) => {
  res.render("404");
})

app.listen(12345, (req, res, next) => {
  console.log("Listening : http://localhost:12345");
});
