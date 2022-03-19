const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const ejs = require("ejs");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("events").EventEmitter.defaultMaxListeners = 100;

const app = express();

<<<<<<< HEAD
// app.use(cookieParser());
app.use(session({
  secret: process.env.COOKIE_SECRET,
  saveUninitialized: true,
  resave: false,
  // cookie: {
  //   maxAge: 3600000
  // }
}));
=======
app.use(cookieParser());
app.use(
  session({
    secret: "this is secret session key also cookie",
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 3600000,
    },
  })
);
>>>>>>> d851746ac96196ba8fab6ec59a6c279ee9f56f79

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "views", "public")));

<<<<<<< HEAD
// app.use((req,res)=>console.log("triggered"))
=======
// app.use((req, res) => console.log("triggered"));
>>>>>>> d851746ac96196ba8fab6ec59a6c279ee9f56f79

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const userRouter = require("./routes/user");

app.use("/", userRouter);

app.use((req, res) => {
  res.render("404");
<<<<<<< HEAD
})

app.listen(12345, (req, res, next) => {
  console.log("Listening : http://localhost:12345");
=======
});
const port = process.env.PORT || 12345;
app.listen(port, "0.0.0.0", (req, res, next) => {
  console.log("Listening : http://localhost:" + port);
>>>>>>> d851746ac96196ba8fab6ec59a6c279ee9f56f79
});
