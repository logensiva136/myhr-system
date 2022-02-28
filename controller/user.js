const axios = require("axios");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy
const userDB = require("../models/userdb")
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});


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
    username: "logen"
  })
};


exports.postLogin = (req, res, next) => {
  const u = req.body.username;
  const p = req.body.password;


  // userDB.getDetailsByUsername(req.body.username).then(data => {
  //   if (data < 1) {
  //     res.render("login", {
  //       error: "user"
  //     })
  //   } else if (data[0].password !== req.body.password) {
  //     res.render("login", {
  //       error: "pass"
  //     })
  //   } else {
  //     req.session.isLoggedIn = true;
  //     req.session.username = data[0].username;
  //     req.session.username = data[0].user_role;
  //     req.session.username = data[0].name;
  //     res.redirect("/")
  //   }
  // })
}

exports.getLogin = (req, res, next) => {
  res.render("login", {
    error: "",
    forgot: false
  });
};

exports.getForgot = (req, res, next) => {
  res.render("login", {
    error: "",
    forgot: true
  });
};

exports.postForgot = (req, res, next) => {
  var mailOptions = {
    from: 'youremail@gmail.com',
    to: 'myfriend@yahoo.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.redirect("/login");
    }
  });
};

exports.getAddUser = (req, res, next) => {
  res.render("register")
}

exports.getLogout = (req, res, next) => {
  res.render("login", {
    error: ""
  })
}

exports.getEleave = (req, res, next) => {
  res.render("eleave", {
    error: "",
    role: "admin"
  })
}