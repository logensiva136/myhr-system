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

//set cookie & session
//3600000

app.use(cookieParser());
app.use(session({
  secret: 'this is secret session key also cookie',
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 3600000
  }
}));


app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "views", "public")));

app.use(bodyParser.urlencoded({
  extended: true
}));

// const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");

// app.use("/admin", adminRouter);
app.use("/", userRouter);

app.use((req, res) => {
  res.render("404")
})

app.listen(9000, (req, res, next) => {
  console.log("Listening : http://localhost:9000");
});