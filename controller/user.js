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
  if (req.session.user) {

    res.render("home", {
      username: "auto generated username"
    });
  } else {
    res.render("401")
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
  res.render("home", {
    username: "logen",
    role: "admin"
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
  res.render("register", {
    role: "admin"
  })
}

exports.getLogout = (req, res, next) => {
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