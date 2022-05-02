const userDB = require("../models/userdb");
const calendar = require("calendar");
const session = require("express-session");
const cal = new calendar.Calendar();
const recentArr = [];
const currentTime = new Date();
const { v4: uuidv4 } = require("uuid");
var moment = require("moment");
var nodeCal = require("node-calendar");
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads/");
  },
  filename: function (req, file, cb) {
    let fn = file.originalname.split(".");
    var id = uuidv4() + "." + fn[fn.length - 1];
    cb(null, id);
  },
});
var upload = multer({ storage: storage }).single("attachment");
const fs = require("fs");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const bcrypt = require("bcrypt");

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
      // console.log(state);
      res.render("att", {
        btnVisible: moment().format("H") > 6,
        clockInOutState: state,
        role: req.session.role,
        username: req.session.fn,
        data: data,
        moment: moment,
      });
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/401");
  }
};

exports.postAtt = (req, res, next) => {
  if (req.session.username) {
    req.body.status === "in"
      ? userDB
          .postClockIn(req.session.username, req.session.rowId, req.body.reason)
          .then((data) => {
            res.redirect("/att");
          })
          .catch((err) => console.log(err))
      : userDB
          .postClockOut(req.session.username, req.body.reason)
          .then((data) => {
            res.redirect("/att");
          });
  } else {
    res.redirect("/");
  }
};

exports.postLogin = (req, res, next) => {
  userDB.getDetailsByUsername(req.body.username, (data) => {
    bcrypt.compare(req.body.password, data[0].password).then(function (result) {
      if (data < 1) {
        res.render("login", {
          error: "user",
          forgot: false,
        });
      } else if (!result) {
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
        req.session.idnum = data[0].idnum;
        req.session.redirect = "";
        res.redirect("/");
      }
    });
  });
};

exports.getLogin = (req, res, next) => {
  res.render("login", {
    error: "",
    forgot: false,
  });
};

exports.getCP = (req, res, next) => {
  if (req.session.ftl) {
    // console.log(req.session.rowId)
    res.render("changePass", { err: "" });
  } else {
    res.redirect("/");
  }
};

exports.postCP = (req, res, next) => {
  const ps1 = req.body.ps1;
  const ps2 = req.body.ps2;
  // console.log(req.session.rowId)
  if (ps1.trim().length === 0 || ps2.trim().length === 0) {
    res.render("changePass", { err: "Password cannot be blank" });
  } else if (req.body.ps1 !== req.body.ps2) {
    res.render("changePass", { err: "Password is not match" });
  } else if (req.body.ps1 === req.body.ps2) {
    bcrypt.hash(req.body.ps1, 8).then(function (hash) {
      // Store hash in your password DB.
      userDB.patchUserPassword(req.session.rowId, hash, (data) => {
        req.session.ftl = false;
        res.redirect("/");
      });
    });
  }
};

exports.getAddUser = (req, res, next) => {
  if (req.session.username) {
    res.render("register", {
      role: req.session.role,
      username: req.session.fn,
      error: "",
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.postAddUser = (req, res, next) => {
  if (req.session.username) {
    var today = new Date();
    var birthDate = new Date(req.body.dob);
    var age = today.getFullYear() - birthDate.getFullYear();
    let achecker = false;

    // verify age
    if (age < 18) {
      achecker = false;
      res.render("register", {
        role: req.session.role,
        error: "age",
        username: req.session.fn,
      });
    } else {
      achecker = true;
    }
    // check username
    userDB.getDetailsByUsername(req.body.username, async (uchecker) => {
      //hash password
      await delay(500);
      // encryptedPass = bcrypt.hash("123");
      await delay(500);

      //checking existing username
      if (!(uchecker.length > 0) && achecker) {
        bcrypt.hash("123", 8).then(function (hash) {
          // Store hash in your password DB.
          // Adding new user
          userDB
            .postNewUser(
              req.body.fname,
              req.body.lname,
              req.body.username,
              req.body.dob,
              req.body.gender,
              req.body.position,
              req.body.userRole,
              hash
            )
            .then(async (data) => {
              await delay(500);
              //get all user for compare
              const allusers = await userDB.listUsers();
              await delay(500);

              // filter user
              const filtereduser = await allusers[allusers.length - 1];

              // ad payroll for new user
              userDB.postNewPayroll(filtereduser.id, req.body.salary);

              //redirect
              res.render("register", {
                role: req.session.role,
                username: req.session.fn,
                error: "",
              });
            });
        });
      } else {
        res.render("register", {
          role: req.session.role,
          username: req.session.fn,
          error: "username",
        });
      }
    });
  } else {
    res.redirect("/");
  }
};

exports.getLogout = (req, res, next) => {
  req.session.destroy();
  res.render("login", {
    error: "",
    forgot: false,
  });
};

exports.getEleave = async (req, res, next) => {
  if (req.session.username) {
    const allLeaves = await userDB.getLeaves();
    const userLeaves = allLeaves.filter((data) => {
      return allLeaves[0].user_id[0].id === req.session.rowId;
    });
    const allUser = await userDB.listUsers();
    const useridandusername = await allUser.map((data) => {
      return { id: data.id, username: data.first_name + " " + data.last_name };
    });

    await delay(1000);
    res.render("eleave", {
      role: req.session.role,
      username: req.session.fn,
      allLeaves: allLeaves,
      userLeave: userLeaves,
      med: userLeaves.filter(
        (data) => data.tol === "medical" && data.status === "approved"
      ),
      ann: userLeaves.filter(
        (data) => data.tol === "annual" && data.status === "approved"
      ),
      hos: userLeaves.filter(
        (data) => data.tol === "hospital" && data.status === "approved"
      ),
      mar: userLeaves.filter(
        (data) => data.tol === "maternity" && data.status === "approved"
      ),
      userdata: useridandusername,
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.postEleave = (req, res, next) => {
  // console.log(req.body.leaveType, req.body.startDate, req.body.endDate);

  const leaveDuration = moment(req.body.endDate).diff(
    moment(req.body.startDate),
    "days"
  );

  userDB.postLeaves(
    req.body.leaveType,
    req.body.startDate,
    req.body.endDate,
    req.session.rowId,
    leaveDuration
  );
  res.redirect("/eleave");
};

exports.patchApprovedLeave = async (req, res, next) => {
  const theurl = req.params.url;
  userDB.patchApprovedLeave(theurl);
  await delay(500);
  res.redirect("/eleave");
};

exports.patchRejectedLeave = async (req, res, next) => {
  const theurl = req.params.url;
  userDB.patchRejectedLeave(theurl);
  await delay(5000);
  res.redirect("/eleave");
};

exports.getSP = async (req, res, next) => {
  const today = new Date();
  const thisDate = today.getDate();
  const thisMonth = today.getMonth();
  const thisYear = today.getYear();
  const spdata = await userDB.getSP(req.session.username);

  if (req.session.username) {
    res.render("smartPlanner", {
      role: req.session.role,
      username: req.session.fn,
      spdata: spdata.data.results,
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
  console.log(spdata.data);
};

exports.postSP = (req, res, next) => {
  userDB.postSP(
    req.body.std,
    req.body.end,
    req.body.desc,
    req.session.username,
    req.session.rowId
  );
  res.redirect("/sp");
};

exports.getDown = (req, res, next) => {
  res.download("uploads/" + req.params.dwurl, req.params.dwurl);
};

exports.getClaim = async (req, res, next) => {
  if (req.session.username) {
    if (req.session.role === "user") {
      const userClaimData = await userDB.getClaimByUser(req.session.username);
      let totalRM = 0;
      i = 0;
      const approvedClaims =
        userClaimData < 1
          ? 0
          : userClaimData.filter((data) => data.status === "approved");
      const pendingClaims =
        userClaimData < 1
          ? 0
          : userClaimData.filter((data) => data.status === "pending");
      const rejectedClaims =
        userClaimData < 1
          ? 0
          : userClaimData.filter((data) => data.status === "rejected");
      while (i < approvedClaims.length) {
        totalRM = totalRM + +approvedClaims[i].amount;
        i++;
      }
      res.render("eclaim", {
        role: req.session.role,
        ecDt: new Date().toLocaleDateString(),
        username: req.session.fn,
        state: false,
        ap: approvedClaims !== 0 ? approvedClaims.length : 0,
        pn: approvedClaims !== 0 ? pendingClaims.length : 0,
        rj: rejectedClaims !== 0 ? rejectedClaims.length : 0,
        total: totalRM,
        all: userClaimData,
      });
    } else {
      const userClaimData = await userDB.getClaim(req.session.username);
      let totalRM = 0;
      i = 0;
      const approvedClaims =
        userClaimData < 1
          ? 0
          : userClaimData.filter((data) => data.status === "approved");
      const pendingClaims =
        userClaimData < 1
          ? 0
          : userClaimData.filter((data) => data.status === "pending");
      const rejectedClaims =
        userClaimData < 1
          ? 0
          : userClaimData.filter((data) => data.status === "rejected");
      while (i < approvedClaims.length) {
        totalRM = totalRM + +approvedClaims[i].amount;
        i++;
      }
      res.render("eclaim", {
        role: req.session.role,
        ecDt: new Date().toLocaleDateString(),
        username: req.session.fn,
        state: false,
        ap: approvedClaims !== 0 ? approvedClaims.length : 0,
        pn: approvedClaims !== 0 ? pendingClaims.length : 0,
        rj: rejectedClaims !== 0 ? rejectedClaims.length : 0,
        total: totalRM,
        all: userClaimData,
        moment: moment,
      });
    }
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.postClaim = async (req, res, next) => {
  if (req.session.username) {
    upload(req, res, async function (err) {
      if (err) {
        console.log(err);
      }
      userDB.postClaim(
        req.session.rowId,
        req.body.typeOfClaim,
        req.body.amount,
        req.body.justify,
        req.file.path,
        req.session.username
      );
      await delay(1000);
      res.redirect("/eclaim");
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.patchApprovedClaim = (req, res, next) => {
  userDB.patchApprovedClaim(req.params.url);
  res.redirect("/eclaim");
};

exports.patchRejectedClaim = (req, res, next) => {
  userDB.patchRejectedClaim(req.params.url);
  res.redirect("/eclaim");
};

exports.getSetting = async (req, res, next) => {
  userDB.getDetailsByUsername(req.session.username, (userDetails) => {
    if (req.session.username) {
      const details = {
        fn: userDetails[0].first_name,
        ln: userDetails[0].last_name,
        pass: userDetails[0].password,
        id: userDetails[0].idnum,
        rowid: userDetails[0].id,
      };

      res.render("setting", {
        role: req.session.role,
        ecDt: new Date().toLocaleDateString(),
        username: req.session.fn,
        data: details,
        err: "",
      });
    } else {
      req.session.currentDir = req.originalUrl;
      res.redirect("/");
    }
  });
};

exports.postSetting = async (req, res, next) => {
  if (req.session.username) {
    const fn = req.body.fname;
    const ln = req.body.lname;
    const ps1 = req.body.ps1;
    const ps2 = req.body.ps2;
    const id = req.body.rowid;
    console.log(id);
    userDB.getDetailsByUsername(req.session.username, async (userDetails) => {
      const details = {
        fn: userDetails[0].first_name,
        ln: userDetails[0].last_name,
        pass: userDetails[0].password,
        id: userDetails[0].idnum,
        rowid: userDetails[0].id,
      };

      if (fn.trim().length === 0 || ln.trim().length === 0) {
        res.render("setting", {
          role: req.session.role,
          ecDt: new Date().toLocaleDateString(),
          username: req.session.fn,
          data: details,
          err: "Enter First Name and Last Name",
        });
      } else if (ps1.trim().length === 0 || ps2.trim().length === 0) {
        res.render("setting", {
          role: req.session.role,
          ecDt: new Date().toLocaleDateString(),
          username: req.session.fn,
          data: details,
          err: "Enter Password",
        });
      } else if (ps1.trim() !== ps2.trim()) {
        res.render("setting", {
          role: req.session.role,
          ecDt: new Date().toLocaleDateString(),
          username: req.session.fn,
          data: details,
          err: "Both passwords were mismatched",
        });
      } else {
        userDB.patchUser(fn.trim(), ln.trim(), ps1.trim(), id);
        await delay(500);
        // res.redirect("/setting");

        res.render("setting", {
          role: req.session.role,
          ecDt: new Date().toLocaleDateString(),
          username: req.session.fn,
          data: details,
          err: "Profile Updated!",
        });
      }
    });
  } else {
    res.redirect("/");
  }
};

exports.au = (req, res) => {
  res.render("401");
};

exports.getPay = async (req, res, next) => {
  await delay(500);
  await delay(500);

  // logged in?
  if (req.session.username) {
    // all pyroll
    const allPayroll = await userDB.getPayroll();
    //payroll by user
    const payrollByUser = await allPayroll.filter((data) => {
      return data.user[0].id === req.session.rowId;
    });
    // console.log(payrollByUser);

    const allClaim = await userDB.getClaim();
    const claimByUser = await allClaim.filter((data) => {
      return data.userId === req.session.rowId;
    });
    // console.log(claimByUser);

    const allCICO = await userDB.getAllCICO();
    const cicoByUser = await allCICO.filter((data) => {
      return data.userId[0].id === req.session.rowId;
    });
    // console.log(cicoByUser);

    const allUser = await userDB.listUsers();
    const currentUserDetail = await allUser.filter((data) => {
      return data.id === req.session.rowId;
    });

    // get year from clock in data by user
    const years = [
      ...new Set(
        cicoByUser.map((e) => {
          return new Date(e.in).getFullYear();
        })
      ),
    ];

    const userSalary = JSON.parse(payrollByUser[0].salary);
    const fulldays = await cicoByUser.filter((data) => {
      return moment(data.out).diff(moment(data.in), "hours") > 9;
    }).length;
    // fulldays.map((data) => moment(data.in).format("D/M/YYYY"));
    // console.log(moment().format("Q"));

    const OT = await cicoByUser.filter((data) => {
      return moment(data.out).diff(moment(data.in), "hours") > 9;
    });
    // console.log(OT);
    OT.map((data) => moment(data.in).format("D/M/YYYY"));

    let usercicobyyear;
    for (let i = 0; i < years.length; i++) {
      usercicobyyear = {
        [years[i]]: cicoByUser.filter((data) => {
          return +moment(data.in).format("YYYY") === years[i];
        }),
      };
    }

    usercicobymonth = usercicobyyear[moment().format("YYYY")].filter((data) => {
      return moment(data.in).format("M") === moment().format("M");
    });

    function calcsalary() {
      const perdaysalary = +userSalary / moment().daysInMonth();
      // console.log(fulldays);
      const fulldaysalary = fulldays * perdaysalary;
      thismonthot = OT.filter((data) => {
        return moment(data.in).format("MMMM") === moment().format("MMMM");
      });

      const otlist = thismonthot.map((data) => {
        return moment(data.out).diff(moment(data.in), "hours") - 10;
      });

      const totalotprice = otlist.reduce((a, b) => a + b, 0);
      return fulldaysalary + totalotprice;
    }
    const usercalculatedsalary = calcsalary().toFixed(2);
    // await delay(1000);
    res.render("payroll", {
      username: req.session.fn,
      role: req.session.role,
      useridfordown: req.session.rowId,
      usercico: cicoByUser,
      salary: userSalary.salary,
      additional: userSalary.additional,
      years: years,
      totalUser: allUser,
      moment: moment,
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.postPay = async (req, res, next) => {
  if (req.session.username) {
    const cl = req.body.claims;
    const le = req.body.leaves;
    const ot = req.body.others;
    const minus = req.body.minus;
    const userid = +req.body.user;
    userDB.postPay(cl, le, ot, minus, userid);
    await delay(500).then((data) => {
      res.redirect("/payroll");
    });
  } else {
    res.redirect("/");
  }
};

exports.payslip = async (req, res, next) => {
  if (req.session.username) {
    // const id = req.params.id;
    const allUser = await userDB.listUsers();
    const currentUserDetail = await allUser.filter((data) => {
      return data.id === req.session.rowId;
    });
    const allCICO = await userDB.getAllCICO();
    const cicoByUser = await allCICO.filter((data) => {
      return data.userId[0].id === req.session.rowId;
    });
    const OT = await cicoByUser.filter((data) => {
      return moment(data.out).diff(moment(data.in), "hours") > 9;
    }).length;
    // console.log(OT);
    const allPayroll = await userDB.getPayroll();
    //payroll by user
    const payrollByUser = await allPayroll.filter((data) => {
      return data.user[0].id === req.session.rowId;
    });

    const onedaysalary =
      +JSON.parse(payrollByUser[0].salary).salary / moment().daysInMonth();

    const otpay = OT * onedaysalary.toFixed(2);
    const basesalary = JSON.parse(payrollByUser[0].salary).salary;
    const additional = JSON.parse(payrollByUser[0].salary).additional;
    const salarytotal = +otpay + +basesalary + +additional;

    res.render("payslip", {
      basic: basesalary,
      add: additional,
      ot: otpay,
      total: salarytotal,
      moment: moment,
      user: currentUserDetail[0],
    });
  } else {
    res.redirect("/");
  }
};
