const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const ejs = require("ejs");
const path = require("path");
const session = require('express-session')
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
require('dotenv').config()

const app = express();

//set session
app.use(session({
  secret: 'this is secret session key also cookie',
  resave: false,
  saveUninitialized: false,
}))

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "views", "public")));

app.use(bodyParser.urlencoded({
  extended: true
}));

const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");

app.use("/admin", adminRouter);
app.use("/", userRouter);


app.use((req, res) => {
  res.render("404")
});

app.listen(12345, (req, res, next) => {
  console.log("Listening : http://localhost:12345");
});