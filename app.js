const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const ejs = require("ejs");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("events").EventEmitter.defaultMaxListeners = 1000;
const moment = require("moment");

const app = express();

app.use(cookieParser());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 3600000,
    },
  })
);

app.set("view engine", "ejs", { async: true });
app.set("views", "views");
app.use(express.static(path.join(__dirname, "views", "public")));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// console.log(moment().toISOString())

const userRouter = require("./routes/user");
const req = require("express/lib/request");
app.use("/", userRouter);


app.use((req, res) => {
  res.render("404");
});
const port = process.env.PORT || 12345;
app.listen(port, (req, res, next) => {
  console.log("Listening : http://localhost:" + port);
});
