const axios = require("axios");
const userDB = require("../models/userdb")
const nodemailer = require("nodemailer");
const calendar = require('calendar');
const cal = new calendar.Calendar();


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});


exports.getLogen = (req, res, next) => {
  if (req.session.username) {
    res.render("home", {
      username: "auto generated username",
      role: "admin"
    });

  } else {
    res.redirect("/401")
  }
};

exports.getAtt = (req, res, next) => {
  let a = new Date();
  res.render("att", {
    btnVisible: a.getHours() > 6 || a.getHours() < 24 ? true : false,
    clockInState: false,
    clockOutState: true,
    role: "admin"
  });

};

exports.getHome = (req, res, next) => {
  if (req.session.username) {
    if (req.session.ftl) {
      res.redirect("/cp");
    } else {
      res.render("home", {
        username: req.session.fn,
        role: "admin"
      })
    }
  } else {
    res.redirect('/401');
  }
};


exports.postLogin = (req, res, next) => {
  const u = req.body.username;
  userDB.getDetailsByUsername(req.body.username).then(data => {
    if (data < 1) {
      res.render("login", {
        error: "user",
        forgot: false
      })
    } else if (data[0].password !== req.body.password) {
      res.render("login", {
        error: "pass",
        forgot: false
      })
    } else {
      req.session.username = data[0].username;
      req.session.email = data[0].email;
      req.session.role = data[0].user_role;
      req.session.fn = data[0].first_name;
      req.session.ftl = data[0].ftl;
      req.session.rowId = data[0].id;
      res.redirect("/");
    }
  }).catch(err => console.error(err))
}

exports.getLogin = (req, res, next) => {
  res.render("login", {
    error: "",
    forgot: false
  });
};

exports.getCP = (req, res, next) => {
  if (req.session.ftl) {
    res.render('changePass');
  } else {
    res.redirect("/");
  }
}

exports.postCP = (req, res, next) => {
  if (req.body.password) {
    userDB.patchUserPassword(req.session.rowId, req.body.password);
    req.session.ftl = false;
    res.redirect("/");
  } else {
    res.redirect('/cp');
  }

}

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
  res.render("register", {
    role: "admin",
    error: ""
  })
}

exports.postAddUser = (req, res, next) => {

  var today = new Date();
  var birthDate = new Date(req.body.dob);
  var age = today.getFullYear() - birthDate.getFullYear();
  --age;

  let achecker = false;
  if (age < 18) {
    achecker = false
    res.render("register", {
      role: "admin",
      error: "age"
    })
  } else {
    achecker = true
  }

  userDB.getDetailsByUsername(req.body.username).then(uchecker => {

    if (!(uchecker.length > 0) && achecker) {
      userDB.postNewUser(req.body.fname, req.body.lname, req.body.username, req.body.dob, req.body.gender, req.body.position, req.body.salary, req.body.userRole);
      res.redirect('/')
    }
    res.render("register", {
      role: "admin",
      error: "username"
    })
  }).catch(err => console.log(err))
}

exports.getLogout = (req, res, next) => {
  req.session.destroy();
  res.render("login", {
    error: "",
    forgot: false
  })
}

exports.getEleave = (req, res, next) => {
  res.render("eleave", {
    role: "admin"
  })
}

// exports.getEleave = (req, res, next) => {
//   res.render("eleave", {
//     error: "",
//     role: "admin"
//   })
// }

exports.getSP = (req, res, next) => {
  const today = new Date(); // today
  // const totalDays = new Date(today.getMonth(), 2, 0) // days in this month
  const thisDate = today.getDate();
  const thisMonth = today.getMonth();
  const thisYear = today.getYear();
  console.log(thisDate)
  // 1. total days
  // 2. month
  // 3. year
  // 4. month + year = date place ?
  // 5. save in object(date places)
  // 6. loops days - > switch (year, month, date) = days ? & set to the box 
  // 7. 

  res.render("smartPlanner", {
    role: "admin",
    days: cal.monthDays(2022, 2),
    todayDate: thisDate
  })
}

exports.getClaim = (req, res, next) => {
  res.render("eclaim", {
    role: "admin",
    ecDt: new Date().toLocaleDateString()
  })
};

exports.postClaim = (req, res, next) => {
  res.send("")
};

exports.getSetting = (req, res, next) => {
  res.render('setting', {
    role: "admin",
    ecDt: new Date().toLocaleDateString()
  })
};

exports.postSetting = (req, res, next) => {
  res.send("setting", {
    role: "admin",
    ecDt: new Date().toLocaleDateString()
  })
};


exports.au = (req, res) => {
  res.render("401")
}