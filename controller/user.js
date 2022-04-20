const userDB = require("../models/userdb");
const calendar = require("calendar");
const session = require("express-session");
const cal = new calendar.Calendar();
const recentArr = [];
const currentTime = new Date();
const { v4: uuidv4 } = require('uuid');
var moment = require('moment');
const multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    let fn = file.originalname.split(".");
    var id = uuidv4() + "." + fn[fn.length - 1];
    cb(null, id);
  }
});
var upload = multer({ storage: storage }).single('attachment');
const fs = require('fs');

exports.getHome = (req, res, next) => {
  if (req.session.username) {
    if (req.session.ftl) {
      if (req.session.currentDir) {
        res.redirect(req.session.currentDir);
        req.session.currentDir = "";
      } else {
        res.redirect("/cp");
      }
    } else {
      if (req.session.currentDir) {
        res.redirect(req.session.currentDir);
        req.session.currentDir = "";
      } else {
        res.render("home", {
          fullname: req.session.fn + " " + req.session.ln,
          username: req.session.fn,
          role: req.session.role,
        });

      }
    }
  } else {
    res.redirect("/login");
  }
};

exports.getAtt = (req, res, next) => {
  if (req.session.username) {
    userDB.getClockInOutByUser(req.session.username, (data) => {
      const state = data.length > 0 ? data[data.length - 1].out !== null : true;
      console.log(state);
      res.render("att", {
        btnVisible: currentTime.getHours() > 6,

        clockInOutState: state,
        role: req.session.role,
        username: req.session.fn,
        data: data,
        moment: moment
      });
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/401");
  }
};

exports.postAtt = (req, res, next) => {

  req.body.status === "in" ? userDB.postClockIn(req.session.username, req.session.rowId, null).then(data => {
    res.redirect("/att");
  }).catch(err => console.log(err)) : userDB.postClockOut(req.session.username, null).then((data) => {
    res.redirect("/att");
  });
};

exports.postLogin = (req, res, next) => {
  userDB
    .getDetailsByUsername(req.body.username, (data) => {
      if (data < 1) {
        res.render("login", {
          error: "user",
          forgot: false,
        });
      } else if (data[0].password !== req.body.password) {
        res.render("login", {
          error: "pass",
          forgot: false,
        });
      } else {
        req.session.username = data[0].username;
        req.session.email = data[0].email;
        req.session.role = data[0].user_role;
        req.session.fn = data[0].first_name;
        req.session.ln = data[0].last_name;
        req.session.ftl = data[0].ftl;
        req.session.rowId = data[0].id;
        req.session.redirect = "";
        res.redirect("/");
      }
    })
};

exports.getLogin = (req, res, next) => {
  res.render("login", {
    error: "",
    forgot: false,
  });
};

exports.getCP = (req, res, next) => {
  if (req.session.ftl) {
    res.render("changePass");
  } else {
    res.redirect("/");
  }
};

exports.postCP = (req, res, next) => {
  if (req.body.password) {
    userDB.patchUserPassword(req.session.rowId, req.body.password, () => {
      req.session.ftl = false;
      res.redirect("/");
    });
  } else {
    res.redirect("/cp");
  }
};

exports.getForgot = (req, res, next) => {
  res.render("login", {
    error: "",
    forgot: true,
  });
};

exports.postForgot = (req, res, next) => {
  var mailOptions = {
    from: "youremail@gmail.com",
    to: "myfriend@yahoo.com",
    subject: "Sending Email using Node.js",
    text: "That was easy!",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      res.redirect("/login");
    }
  });
};

exports.getAddUser = (req, res, next) => {
  if (req.session.username) {
    res.render("register", {
      role: req.session.role,
      username: req.session.fn,
      error: "",
    });
    // const newArr = [];
    if (recentArr.length < 1) {
      recentArr.push("R");
    } else {
      recentArr.pop("R");
      recentArr.push("R", ...recentArr);
    }
    req.cookie = "recents=" + recentArr;
    console.log(req.cookie);
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.postAddUser = (req, res, next) => {
  var today = new Date();
  var birthDate = new Date(req.body.dob);
  var age = today.getFullYear() - birthDate.getFullYear();
  let achecker = false;

  if (age < 18) {
    achecker = false;
    res.render("register", {
      role: req.session.role,
      error: "age",
    });
  } else {
    achecker = true;
  }

  userDB
    .getDetailsByUsername(req.body.username, (uchecker) => {
      if (!(uchecker.length > 0) && achecker) {
        userDB.postNewUser(
          req.body.fname,
          req.body.lname,
          req.body.username,
          req.body.dob,
          req.body.gender,
          req.body.position,
          req.body.salary,
          req.body.userRole
        );
        res.redirect("/");
      }
      res.render("register", {
        role: req.session.role,
        username: req.session.fn,
        error: "username",
      });
    })
    .catch((err) => console.log(err));
};

exports.getLogout = (req, res, next) => {
  req.session.destroy();
  res.render("login", {
    error: "",
    forgot: false,
  });
};

exports.getEleave = (req, res, next) => {
  if (recentArr.length < 1) {
    recentArr.push("L");
  } else if (recentArr.includes("L")) {
    recentArr.pop("L");
    recentArr.push("L", ...recentArr);
  }
  if (req.session.username) {
    res.render("eleave", {
      role: req.session.role,
      username: req.session.fn,
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

// exports.getEleave = (req, res, next) => {
//   res.render("eleave", {
//     error: "",
//     role: "admin"
//   })
// }

exports.getSP = (req, res, next) => {
  const today = new Date();
  const thisDate = today.getDate();
  const thisMonth = today.getMonth();
  const thisYear = today.getYear();

  if (req.session.username) {
    res.render("smartPlanner", {
      role: req.session.role,
      days: cal.monthDays(2022, 2),
      todayDate: thisDate,
      username: req.session.fn,
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.getClaim = (req, res, next) => {
  // fs.readdir("uploads/", (err, files) => {
  //   if (err) {
  //     console.log(err)
  //   }
  //   files.forEach(file => {
  //     fs.rm("uploads/" + file, { recursive: false }, err => {
  //       console.log(err);
  //     });

  //   })
  // })
  if (req.session.username) {
    res.render("eclaim", {
      role: req.session.role,
      ecDt: new Date().toLocaleDateString(),
      username: req.session.fn,
      state: false
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }

};

exports.postClaim = (req, res, next) => {
  if (req.session.username) {
    upload(req, res, function (err) {
      if (err) {
        console.log(err)
      }
      console.log(req.file)
      userDB.postClaim(req.session.rowId, req.body.typeOfClaim, req.body.amount, req.body.justify, req.file.path, req.session.username)
    })
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};


exports.getSetting = (req, res, next) => {
  if (req.session.username) {
    res.render("setting", {
      role: req.session.role,
      ecDt: new Date().toLocaleDateString(),
      username: req.session.fn,
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.postSetting = (req, res, next) => {
  res.send("setting", {
    role: req.session.role,
    ecDt: new Date().toLocaleDateString(),
  });
};

exports.getPay = (req, res, next) => {
  if (req.session.username) {
    res.render("payroll", { username: req.session.fn, role: req.session.role })
    userDB.getPayroll((data) => { console.log(data) })
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
}
exports.au = (req, res) => {
  res.render("401");
};
