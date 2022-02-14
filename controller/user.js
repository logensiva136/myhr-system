const axios = require("axios");

exports.getLogen = (req, res, next) => {
  res.render("home", {
    username: "auto generated username"
  });
};

exports.getAtt = (req, res, next) => {
  let a = new Date();

  res.render("att", {
    btnVisible: a.getHours() > 6 || a.getHours() < 24 ? true : false,
    clockInState: false,
    clockOutState: true
  });
};

exports.getHome = (req, res, next) => {
  res.render("home", {
    username: "Kishan"
  });
};

exports.getLogin = (req, res, next) => {
  res.render("login", {
    loginForm: true
  });
};

exports.getLogout = (req, res, next) => {
  res.redirect("login")
}