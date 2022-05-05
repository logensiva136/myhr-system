const userDB = require("../models/userdb");
const { v4: uuidv4 } = require("uuid");
var moment = require("moment");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
//delay method
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const multer = require("multer");
// multer set destination & set name
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
// call multer
var upload = multer({ storage: storage }).single("attachment");

//check all session info
exports.getHome = (req, res, next) => {
  if (req.session.username) {
    //ftl is first tiem login
    if (req.session.ftl) {
      if (req.session.currentDir) {
        res.redirect(req.session.currentDir);
        req.session.currentDir = "";
      } else {
        // change pass
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
      // check user's att out list
      const state = data.length > 0 ? data[data.length - 1].out !== null : true;
      // render page
      res.render("att", {
        // 5am above appear in btn
        btnVisible: moment().format("H") > 6,
        // if out show in if in show out
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
    //if check if in do in db func else out db func
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
  // get data by usename from db
  userDB.getDetailsByUsername(req.body.username, (data) => {
    //check data
    if (data < 1) {
      res.render("login", {
        error: "user",
        forgot: false,
      });
    } else {
      bcrypt
        .compare(req.body.password, data[0].password)
        .then(function (result) {
          if (!result) {
            res.render("login", {
              error: "pass",
              forgot: false,
            });
          } else {
            // save all session infos
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
    }
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
    res.render("changePass", { err: "" });
  } else {
    res.redirect("/");
  }
};

exports.postCP = (req, res, next) => {
  // declare passwords in var
  const ps1 = req.body.ps1;
  const ps2 = req.body.ps2;

  // check both is blank?
  if (ps1.trim().length === 0 || ps2.trim().length === 0) {
    res.render("changePass", { err: "Password cannot be blank" });
  } else if (req.body.ps1 !== req.body.ps2) {
    // if not same both password
    res.render("changePass", { err: "Password is not match" });
  } else if (req.body.ps1 === req.body.ps2) {
    //save new password
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
    //today date
    var today = new Date();
    // get date of birth
    var birthDate = new Date(req.body.dob);
    // calc age
    var age = today.getFullYear() - birthDate.getFullYear();
    //age checker false
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
        // hashing default '123' password for first time login
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
              // hashed password
              hash
            )
            .then(async (data) => {
              await delay(500);
              //get all user infos for compare (later use for create payroll data)
              const allusers = await userDB.listUsers();
              await delay(500);

              // filter user (get last added data)
              const filtereduser = await allusers[allusers.length - 1];

              // add payroll for new user
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
        // if found username in db show username exist error
        res.render("register", {
          role: req.session.role,
          username: req.session.fn,
          error: "username",
        });
      }
    });
  } else {
    // if not logged in or expired go to homepage then redirect login page automatically
    res.redirect("/");
  }
};

exports.getLogout = (req, res, next) => {
  // log out by simply delete sesion data
  req.session.destroy();
  // then go to login page
  res.render("login", {
    error: "",
    forgot: false,
  });
};

exports.getEleave = async (req, res, next) => {
  // check logins
  if (req.session.username) {
    // get all leave datas
    const allLeaves = await userDB.getLeaves();
    //filter by user with user id from current session
    const userLeaves = allLeaves.filter((data) => {
      //get  all data if match user id
      return data.user_id[0].id === req.session.rowId;
    });

    // get aal user datas
    const allUser = await userDB.listUsers();

    // create array which contains user id & username (first name & last name) from all user data
    const useridandusername = await allUser.map((data) => {
      return { id: data.id, username: data.first_name + " " + data.last_name };
    });

    // filter approved medical leaves only that req by current user
    const countMedLeaves = userLeaves.filter(
      (data) => data.tol === "medical" && data.status === "approved"
    );

    // totaling approved med leaves for calc to render on page
    const totalMed = countMedLeaves.reduce((init, currentVal) => {
      return (
        init +
        moment(currentVal.end_date).diff(moment(currentVal.start_date), "days")
      );
    }, 0);

    // filter approved annual leaves only that req by current user
    const countAnnLeaves = userLeaves.filter(
      (data) => data.tol === "annual" && data.status === "approved"
    );

    // totaling approved annual leaves for calc to render on page
    const totalAnn = countAnnLeaves.reduce((init, currentVal) => {
      return (
        init +
        moment(currentVal.end_date).diff(moment(currentVal.start_date), "days")
      );
    }, 0);

    // filter approved Hospitalization leaves only that req by current user
    const countHosLeaves = userLeaves.filter(
      (data) => data.tol === "hospital" && data.status === "approved"
    );

    // totaling approved hospitalization leaves for calc to render on page
    const totalHos = countHosLeaves.reduce((init, currentVal) => {
      return (
        init +
        moment(currentVal.end_date).diff(moment(currentVal.start_date), "days")
      );
    }, 0);

    // filter approved Martinary leaves only that req by current user
    const countMarLeaves = userLeaves.filter(
      (data) => data.tol === "maternity" && data.status === "approved"
    );

    // totaling approved martinary leaves for calc to render on page
    const totalMar = countMarLeaves.reduce((init, currentVal) => {
      return (
        init +
        moment(currentVal.end_date).diff(moment(currentVal.start_date), "days")
      );
    }, 0);

    await delay(1000);
    // rendering with infos gather at the above
    res.render("eleave", {
      role: req.session.role,
      username: req.session.fn,
      // all leaves data for admin useage
      allLeaves: allLeaves,
      // total leaves balance calculation
      userLeave:
        userLeaves.length > 0
          ? userLeaves[userLeaves.length - 1].leave_left
          : 60,
      // total approved med leaves
      med: totalMed,
      // total approved annual leaves
      ann: totalAnn,
      // total approved hospitalization leaves
      hos: totalHos,
      // total approved martinary leaves
      mar: totalMar,
      // user's firstname and last name for dropdaown data
      userdata: useridandusername,
    });
  } else {
    // if not logged in go back to home then login
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.postEleave = async (req, res, next) => {
  // get leave duration (in days) from user inputs
  const leaveDuration = moment(req.body.endDate).diff(
    moment(req.body.startDate),
    "days"
  );

  // create leave data on db
  userDB.postLeaves(
    req.body.leaveType,
    req.body.startDate,
    req.body.endDate,
    req.session.rowId,
    leaveDuration
  );
  await delay(500);
  // then refresh page (redirect to same page)
  res.redirect("/eleave");
};

exports.patchApprovedLeave = async (req, res, next) => {
  // get leave id from url
  const theurl = req.params.url;
  // upadate status as approved
  userDB.patchApprovedLeave(theurl);
  await delay(500);
  // refresh
  res.redirect("/eleave");
};

exports.patchRejectedLeave = async (req, res, next) => {
  // get leave id from url
  const theurl = req.params.url;
  // update status as rejected
  userDB.patchRejectedLeave(theurl);
  await delay(5000);
  // refresh
  res.redirect("/eleave");
};

exports.getSP = async (req, res, next) => {
  // check logged in ?
  if (req.session.username) {
    // get all smart planner data from db by username
    const spdata = await userDB.getSP(req.session.username);
    // render page with retrieved sp data
    res.render("smartPlanner", {
      role: req.session.role,
      username: req.session.fn,
      spdata: spdata.data.results,
    });
  } else {
    // else go to login page
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.postSP = async (req, res, next) => {
  // get all data from session and user input
  const fn = req.session.fn;
  const ln = req.session.ln;
  const std = req.body.std;
  const end = req.body.end;
  const desc = req.body.desc;
  const uname = req.session.username;
  const userid = req.session.rowId;
  const email = req.session.email;

  // initialize the nodemailer by configuring sender mail
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bwayne1771@gmail.com",
      pass: "kishan123",
    },
  });

  // configuring mail messages
  var mailDetails = {
    from: "bwayne1771@gmail.com",
    to: email,
    subject: "Event Created | " + fn + " " + ln + " | My HR System",
    html:
      "<h4>Your Event Created</h4><br><p>This is a reminder mail from My HR System</p><br><p>Description : " +
      desc +
      "</p><p>Start Date : " +
      std +
      "</p><p>End Date : " +
      end +
      "</p>",
  };

  // triggering nodemailer to send mail
  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(err);
      console.log("Error Occurs");
    } else {
      console.log(data);
      console.log("Email sent successfully");
    }
  });

  // while send mail add data into the db
  await delay(500);
  await userDB.postSP(std, end, desc, uname, userid);
  // then redirect to same page
  res.redirect("/sp");
};

exports.getDown = (req, res, next) => {
  // initialize download after getting name from url value
  const theurl = path.join("uploads", req.params.dwurl);
  res.download(theurl, req.params.dwurl);
};

exports.getClaim = async (req, res, next) => {
  // check logged in ?
  if (req.session.username) {
    // if admin or not
    if (req.session.role === "user") {
      // if user get claims by username
      const userClaimData = await userDB.getClaimByUser(req.session.username);
      // init totalRM is 0
      let totalRM = 0;
      // init i = 0 for loops
      i = 0;

      // get numbers of claims by conditions
      // if not claims not exist return 0 else get filter claims from each claims then save in the variable

      // approved claims
      const approvedClaims =
        userClaimData < 1
          ? 0
          : userClaimData.filter((data) => data.status === "approved");

      // pending claims
      const pendingClaims =
        userClaimData < 1
          ? 0
          : userClaimData.filter((data) => data.status === "pending");

      // rejected claims
      const rejectedClaims =
        userClaimData < 1
          ? 0
          : userClaimData.filter((data) => data.status === "rejected");

      // totaling user's approved claims amount to render to page
      while (i < approvedClaims.length) {
        totalRM = totalRM + +approvedClaims[i].amount;
        i++;
      }

      //rendare page with retrieved datas
      await delay(500);
      res.render("eclaim", {
        role: req.session.role,
        // declare default date on page
        ecDt: new Date().toLocaleDateString(),
        username: req.session.fn,
        state: false,
        // total claims by status
        ap: approvedClaims !== 0 ? approvedClaims.length : 0,
        pn: approvedClaims !== 0 ? pendingClaims.length : 0,
        rj: rejectedClaims !== 0 ? rejectedClaims.length : 0,
        // total approved RMs
        total: totalRM,
        // all claim data fro admin usage
        all: userClaimData,
      });
    } else {
      // all same as above function
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
        // parse the moment function to the frontend
        moment: moment,
      });
    }
  } else {
    // if not logged in redirect to login page
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.postClaim = async (req, res, next) => {
  // check login status
  if (req.session.username) {
    // init upload function (the multer will get user attachment input to upload file to server)
    upload(req, res, async function (err) {
      if (err) {
        console.log(err);
      }

      // the datas will push to db
      userDB.postClaim(
        req.session.rowId,
        req.body.typeOfClaim,
        req.body.amount,
        req.body.justify,
        req.file.path,
        req.session.username
      );

      // then redirect to same page
      await delay(1000);
      res.redirect("/eclaim");
    });
  } else {
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.patchApprovedClaim = (req, res, next) => {
  // update status to approved
  userDB.patchApprovedClaim(req.params.url);
  res.redirect("/eclaim");
};

exports.patchRejectedClaim = (req, res, next) => {
  // update status to rejected
  userDB.patchRejectedClaim(req.params.url);
  res.redirect("/eclaim");
};

exports.getSetting = async (req, res, next) => {
  // user data by username
  userDB.getDetailsByUsername(req.session.username, (userDetails) => {
    // check logged in ?
    if (req.session.username) {
      // save data in a JSON object to renader on page (firstname,lastname,user id, employee id)
      const details = {
        fn: userDetails[0].first_name,
        ln: userDetails[0].last_name,
        id: userDetails[0].idnum,
        rowid: userDetails[0].id,
      };

      // render page without error
      res.render("setting", {
        role: req.session.role,
        ecDt: new Date().toLocaleDateString(),
        username: req.session.fn,
        data: details,
        err: "",
        color: "",
      });
    } else {
      req.session.currentDir = req.originalUrl;
      res.redirect("/");
    }
  });
};

exports.postSetting = async (req, res, next) => {
  // check logged in ?
  if (req.session.username) {
    // get data from user
    const fn = req.body.fname;
    const ln = req.body.lname;
    const ps1 = req.body.ps1;
    const ps2 = req.body.ps2;
    const id = req.body.rowid;
    // get user data by username given by user
    userDB.getDetailsByUsername(req.session.username, async (userDetails) => {
      // save data in a JSON object to renader on page (firstname,lastname,user id, employee id)
      const details = {
        fn: userDetails[0].first_name,
        ln: userDetails[0].last_name,
        id: userDetails[0].idnum,
        rowid: userDetails[0].id,
      };

      // chacks first name and last name were blank or not
      if (fn.trim().length === 0 || ln.trim().length === 0) {
        // render page with error
        res.render("setting", {
          role: req.session.role,
          ecDt: new Date().toLocaleDateString(),
          username: req.session.fn,
          data: details,
          err: "Enter First Name and Last Name",
          color: "red",
        });
      } else if (ps1.trim().length !== 0 || ps2.trim().length !== 0) {
        // if password is not blank means user want to update password
        if (ps1.trim() !== ps2.trim()) {
          // checks both pass field same or not
          // not render page with error
          res.render("setting", {
            role: req.session.role,
            ecDt: new Date().toLocaleDateString(),
            username: req.session.fn,
            data: details,
            err: "Both passwords were mismatched",
            color: "red",
          });
        } else {
          // if password validation is true then update all user info with password
          // render page with success message
          userDB.patchUser(fn.trim(), ln.trim(), ps1.trim(), id, "pass");
          await delay(500);
          res.render("setting", {
            role: req.session.role,
            ecDt: new Date().toLocaleDateString(),
            username: req.session.fn,
            data: details,
            err: "Profile Updated",
            color: "green",
          });
        }
      } else {
        // if  validation is true (with blank password field) then update all user info without password
        // render page with success message
        userDB.patchUser(fn.trim(), ln.trim(), ps1.trim(), id, "");
        await delay(500);
        res.render("setting", {
          role: req.session.role,
          ecDt: new Date().toLocaleDateString(),
          username: req.session.fn,
          data: details,
          err: "Profile Updated!",
          color: "green",
        });
      }
    });
  } else {
    // else redirect to login page
    res.redirect("/");
  }
};

exports.au = (req, res) => {
  // render unauthorised page for certain pages
  res.render("401");
};

exports.getPay = async (req, res, next) => {
  // wait 1 sec (in case the page render after db actions)
  await delay(500);
  await delay(500);

  // logged in?
  if (req.session.username) {
    // retrieve all pyroll
    const allPayroll = await userDB.getPayroll();
    // retrieve all payroll by user
    const payrollByUser = await allPayroll.filter((data) => {
      return data.user[0].id === req.session.rowId;
    });

    // retrieve all claim
    const allClaim = await userDB.getClaim();
    // retrieve all claim by user
    const claimByUser = await allClaim.filter((data) => {
      return data.userId === req.session.rowId;
    });

    // retrieve all attendace
    const allCICO = await userDB.getAllCICO();
    // retrieve all attendace by user
    const cicoByUser = await allCICO.filter((data) => {
      return data.userId[0].id === req.session.rowId;
    });

    // retrieve all user data
    const allUser = await userDB.listUsers();
    // retrieve all user data by user
    const currentUserDetail = await allUser.filter((data) => {
      return data.id === req.session.rowId;
    });

    // get year from clock in field data from database by user
    const years = [
      ...new Set(
        cicoByUser.map((e) => {
          return new Date(e.in).getFullYear();
        })
      ),
    ];

    // get base salary fro current user
    const userSalary = JSON.parse(payrollByUser[0].salary);

    // get fullday number
    const fulldays = await cicoByUser.filter((data) => {
      return moment(data.out).diff(moment(data.in), "hours") > 9;
    }).length;

    // get OT data
    const OT = await cicoByUser.filter((data) => {
      return moment(data.out).diff(moment(data.in), "hours") > 9;
    });

    // get all clock in data in specific format; Exp : 22/2/2022
    OT.map((data) => moment(data.in).format("D/M/YYYY"));

    // render page with retrieve and calculated values
    console.log(userSalary.additional);
    res.render("payroll", {
      username: req.session.fn,
      role: req.session.role,
      useridfordown: req.session.rowId,
      // send all user's cico datas to frontend
      usercico: cicoByUser,
      // calculated salary
      salary: userSalary.salary,
      // send additional amount for user to frontend
      additional:
        userSalary.additional === undefined ? 0 : userSalary.additional,
      // years
      years: years,
      // user datas for admin use
      totalUser: allUser,
      // allow frontend access momentjs
      moment: moment,
    });
  } else {
    // is not logged in redirect to login page
    req.session.currentDir = req.originalUrl;
    res.redirect("/");
  }
};

exports.postPay = async (req, res, next) => {
  // checks logins ?
  if (req.session.username) {
    // decalre values in vars
    const cl = req.body.claims;
    const le = req.body.leaves;
    const ot = req.body.others;
    const minus = req.body.minus;
    const userid = +req.body.user;
    // saving payroll (additional amount) data
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
    // get all user data  from db
    const allUser = await userDB.listUsers();
    // filter by user id
    const currentUserDetail = await allUser.filter((data) => {
      return data.id === req.session.rowId;
    });

    // get all cico data frm db
    const allCICO = await userDB.getAllCICO();
    //filter by user id
    const cicoByUser = await allCICO.filter((data) => {
      return data.userId[0].id === req.session.rowId;
    });
    // get total number of OT cico form cico by user var
    const OT = await cicoByUser.filter((data) => {
      return moment(data.out).diff(moment(data.in), "hours") > 9;
    }).length;

    // get all payroll dat frm db
    const allPayroll = await userDB.getPayroll();

    // filter payroll by user
    const payrollByUser = await allPayroll.filter((data) => {
      return data.user[0].id === req.session.rowId;
    });

    // calc one day salary
    const onedaysalary =
      +JSON.parse(payrollByUser[0].salary).salary / moment().daysInMonth();

    // calc ot amount
    const otpay = OT * onedaysalary.toFixed(2);
    // get base salary frm retrieved payroll data by user
    const basesalary = JSON.parse(payrollByUser[0].salary).salary;
    // get base additional amounts frm retrieved payroll data by user
    const additional = JSON.parse(payrollByUser[0].salary).additional;
    // calc total salary with ot + base saalary + additional amounts
    const salarytotal = +otpay + +basesalary + +additional;

    // render page with calculated values then download by html2pdf js script
    res.render("payslip", {
      basic: basesalary,
      add: additional,
      ot: otpay,
      total: salarytotal,
      moment: moment,
      user: currentUserDetail[0],
    });
  } else {
    // if not logged in redirect to login page
    res.redirect("/");
  }
};
