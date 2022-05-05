const axios = require("axios");
const moment = require("moment");
const bcrypt = require("bcrypt");

// inittialize axios defaults (to prevent code redundancy)
const api = axios.create({
  baseURL: "https://api.baserow.io/api/",
  headers: {
    Authorization: `Token ${process.env.THE_KEY}`,
    Connection: "close",
  },
});

const allUserData = (cb) => {
  // get all user data (for internal use)
  return api({
    method: "GET",
    url: "database/rows/table/47848/?user_field_names=true",
  })
    .then((data) => cb(data.data.results))
    .catch((err) => console.log(err));
};

const allPayroll = (cb) => {
  // get all payroll data
  return api({
    method: "GET",
    url: "database/rows/table/47849/?user_field_names=true",
  })
    .then((data) => cb(data.data.results))
    .catch((err) => console.log(err));
};

exports.listUsers = () => {
  // get all user data (for external use)
  return allUserData((data) => {
    return data;
  });
};

exports.getDetailsByUsername = (username, cb) => {
  // get all user data then filter by given username
  allUserData((data) => {
    cb(data.filter((data) => data.username === username));
  }).catch((err) => console.log(err));
};

exports.postNewUser = async (
  fname,
  lname,
  uname,
  dob,
  gender,
  position,
  userRole,
  pass
) => {
  // create and declare random id number
  const useridn = Math.floor(1000 + Math.random() * 9000);

  // default mail
  const mail = uname + "@yopmail.com";

  // calc age
  function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    return --age;
  }

  // creating new user
  api({
    method: "post",
    url: "database/rows/table/47848/?user_field_names=true",
    data: {
      idnum: useridn,
      username: uname,
      password: pass,
      email: mail,
      position: position,
      age: getAge(dob),
      gender: gender,
      user_role: userRole,
      first_name: fname,
      last_name: lname,
      dob: dob,
      // making first time login user to force to change password on first login
      ftl: true,
    },
  }).catch((err) => {
    console.log(err.toJSON());
  });
};

exports.patchUserPassword = (row_id, newPs, cb) => {
  // changing new password after first login
  return api({
    method: "PATCH",
    url: `database/rows/table/47848/${row_id}/?user_field_names=true`,
    data: {
      password: newPs,
      ftl: false,
    },
  })
    .then((data) => cb(data))
    .catch((err) => console.log(err.toJSON()));
};

exports.getClockInOutByUser = (username, cb) => {
  // get all cico data by username (filtered)
  return api({
    method: "GET",
    url: "database/rows/table/47850/?user_field_names=true",
  })
    .then((data) =>
      cb(data.data.results.filter((atts) => atts.username === username))
    )
    .catch((err) => console.log(err));
};

exports.getAllCICO = () => {
  // get all cico data
  return api({
    method: "GET",
    url: "database/rows/table/47850/?user_field_names=true",
  })
    .then((data) => {
      return data.data.results;
    })
    .catch((err) => console.log(err));
};

exports.postClockIn = (username, id, reason_in) => {
  // create clock in data
  if (reason_in) {
    // if have reason fill up reason field with value
    return api({
      method: "POST",
      url: "database/rows/table/47850/?user_field_names=true",
      data: {
        username: username,
        userId: [id],
        in: moment(),
        out: null,
        reason_in: reason_in,
        reason_out: "",
      },
    });
  } else {
    // if not leave it blank in reason
    return api({
      method: "POST",
      url: "database/rows/table/47850/?user_field_names=true",
      data: {
        username: username,
        userId: [id],
        in: moment(),
        out: null,
        reason_in: "",
        reason_out: "",
      },
    });
  }
};

exports.postClockOut = (username, reason_out) => {
  // ge all cico data
  return api({
    method: "GET",
    url: "database/rows/table/47850/?user_field_names=true",
  })
    .then((data) => {
      // filter by username then parse data to next function
      const filteredData = data.data.results.filter(
        (val) => val.username === username
      );
      if (reason_out) {
        // if user given reason update filtered data (retrieved data) in clock out and reson field
        return api({
          method: "patch",
          url: `database/rows/table/47850/${
            filteredData[filteredData.length - 1].id
          }/?user_field_names=true`,
          data: {
            out: moment(),
            reason_out: reason_out,
          },
        });
      } else {
        // if not just update clock out without reason in filtered data (retrieved data)
        return api({
          method: "patch",
          url: `database/rows/table/47850/${
            filteredData[filteredData.length - 1].id
          }/?user_field_names=true`,
          data: {
            out: moment(),
            reason_out: "",
          },
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.postClaim = (userid, typeofclaim, amounts, justify, thefile, uname) => {
  // create random idnumber
  const idn = Math.floor(1000 + Math.random() * 9000);
  // get date function
  const now = new Date();

  // create claim data with given value
  api({
    method: "POST",
    url: "database/rows/table/47872/?user_field_names=true",
    data: {
      claim_id: idn,
      userId: userid,
      date: now.toISOString(),
      amount: amounts,
      justification: justify,
      attachment: thefile,
      status: "pending",
      toc: typeofclaim,
      username: uname,
    },
  }).catch((err) => console.error(err.toJSON()));
};

exports.getClaim = () => {
  // get all claim data
  return api({
    method: "GET",
    url: `https://api.baserow.io/api/database/rows/table/47872/?user_field_names=true`,
  })
    .then((data) => {
      return data.data.results;
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getClaimByUser = (uname) => {
  // get claim data by username
  return api({
    method: "GET",
    url: `https://api.baserow.io/api/database/rows/table/47872/?user_field_names=true`,
  })
    .then((data) => {
      return data.data.results.filter((data) => {
        return data.username === uname;
      });
    })
    .catch((err) => {
      console.log(err);
    });
  // // console.log(allClaims)
  // const filterClaims = allClaims.filter(data => data.username === uname)
  // // console.log(filterClaims[0])
};

const claims = () => {
  // get all claims (for internal use)
  return api({
    method: "GET",
    url: `https://api.baserow.io/api/database/rows/table/47872/?user_field_names=true`,
  })
    .then((data) => {
      return data.data.results;
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.patchApprovedClaim = async (claimId) => {
  // get all claims
  const allClaims = await claims();
  //filter claims by claimid
  const filteredClaims = allClaims.filter((data) => {
    return data.claim_id === claimId;
  });

  // update status to approved
  return api({
    method: "patch",
    url: `https://api.baserow.io/api/database/rows/table/47872/${filteredClaims[0].id}/?user_field_names=true`,
    data: {
      status: "approved",
    },
  });
};

exports.patchRejectedClaim = async (claimId) => {
  // get claim data
  const allClaims = await claims();
  // filter claim data by claim id
  const filteredClaims = allClaims.filter((data) => {
    return data.claim_id === claimId;
  });

  // update claim status to rejected
  return api({
    method: "patch",
    url: `https://api.baserow.io/api/database/rows/table/47872/${filteredClaims[0].id}/?user_field_names=true`,
    data: {
      status: "rejected",
    },
  });
};

exports.getPayroll = () => {
  // get all payroll data
  return api({
    method: "GET",
    url: "database/rows/table/47849/?user_field_names=true",
  })
    .then((data) => {
      return data.data.results;
    })
    .catch((err) => console.log(err));
};

exports.postNewPayroll = (row_id, salary) => {
  // create random idnumber for payroll id
  const payidn = Math.floor(1000 + Math.random() * 9000);

  // cerate payroll data for user (it's triggered on registration)
  api({
    method: "post",
    url: "database/rows/table/47849/?user_field_names=true",
    data: {
      idnum: payidn,
      // create object that contains base salary and 0 additional amount
      salary: JSON.stringify({ salary: salary, additional: 0 }),
      user: [row_id],
    },
  });
};

const leaves = () => {
  // get all leave data frm db (for internal use)
  return api({
    url: "https://api.baserow.io/api/database/rows/table/57611/?user_field_names=true",
  }).then((data) => data.data.results);
};

exports.getLeaves = async () => {
  // get leaves data from db (for external use)
  return api({
    url: "https://api.baserow.io/api/database/rows/table/57611/?user_field_names=true",
  }).then((data) => data.data.results);
};

exports.postLeaves = async (tol, sd, ed, userid, leaveDuration) => {
  // get all leave datas
  const allLeaves = await leaves();
  //filter by user id
  const userLeave = await allLeaves.filter((data) => {
    return data.user_id[0].id === userid;
  });

  // loops for count leave_balance
  let theCount;
  if (userLeave.length < 1) {
    // if don't have leave record show 60 days leave balance
    theCount = 60;
  } else {
    // if have show leave_left of last leave record
    theCount = userLeave[userLeave.length - 1].leave_left;
  }

  // loops for count leave_taken
  let theAnotherCount;
  if (userLeave.length < 1) {
    // if don't have leave record show 0 days leave taken
    theAnotherCount = 0;
  } else {
    // if have show leave_taken of last leave record
    theAnotherCount = userLeave[userLeave.length - 1].leave_left;
  }

  // create random idnumber for leave id
  const idn = Math.floor(1000 + Math.random() * 9000);

  // create leave record with status = pending
  api({
    method: "post",
    url: "https://api.baserow.io/api/database/rows/table/57611/?user_field_names=true",
    data: {
      leave_request_id: idn,
      tol: tol,
      start_date: sd,
      end_date: ed,
      user_id: [userid],
      status: "pending",
      leave_left: theCount,
      leave_taken: theAnotherCount,
    },
  });
};

exports.patchApprovedLeave = async (claim_id) => {
  // get all leave datas frm db
  const allLeaves = await leaves();
  // filter leaves by leave id
  const thisClaim = await allLeaves.filter((data) => {
    return data.leave_request_id === claim_id;
  });

  // calc leaves duration from filtered leave
  const calcDays = moment(thisClaim[0].end_date).diff(
    moment(thisClaim[0].start_date),
    "days"
  );

  // get taken count
  const getTaken = +thisClaim[0].leave_taken;
  // get balance count
  const getBal = +thisClaim[0].leave_left;

  // update leave status to approved and counts (taken and balance)
  api({
    method: "patch",
    url: `https://api.baserow.io/api/database/rows/table/57611/${thisClaim[0].id}/?user_field_names=true`,
    data: {
      status: "approved",
      leave_taken: getTaken + calcDays,
      leave_left: getBal - calcDays,
    },
  }).catch((err) => {
    console.log(err.toJSON());
  });
};

exports.patchRejectedLeave = async (claim_id) => {
  // get all leave data
  const allLeaves = await leaves();
  // filter leave by leave id
  const thisClaim = allLeaves.filter((data) => {
    return data.leave_request_id === claim_id;
  });

  // update leave status to rejected adn don't make any changes in counts
  api({
    method: "patch",
    url: `https://api.baserow.io/api/database/rows/table/57611/${thisClaim[0].id}/?user_field_names=true`,

    data: {
      status: "rejected",
    },
  }).catch((err) => {
    console.log(err.toJSON());
  });
};

exports.postSP = (sd, ed, desc, uname, uid) => {
  // create idnumber for smart planner
  const idn = Math.floor(1000 + Math.random() * 9000);

  // create smart planner data
  return api({
    method: "post",
    url: "https://api.baserow.io/api/database/rows/table/61247/?user_field_names=true",
    data: {
      idnum: idn,
      startDate: sd,
      endDate: ed,
      description: desc,
      username: uname,
      userId: [uid],
    },
  }).catch((err) => console.log(err.toJSON()));
};

exports.getSP = (uname) => {
  // get all smart planner data frm db
  return api({
    method: "get",
    url: "https://api.baserow.io/api/database/rows/table/61247/?user_field_names=true",
  }).catch((err) => console.log(err.toJSON()));
};

exports.patchUser = async (fn, ln, pass, id, val) => {
  // update user datas
  // check whether this is for password change or not
  //if yes
  if (val === "pass") {
    // encrypt (hashing) new password
    bcrypt.hash(pass, 8, (err, hash) => {
      // user data with password
      api({
        method: "patch",
        url: `https://api.baserow.io/api/database/rows/table/47848/${id}/?user_field_names=true`,
        data: {
          first_name: fn,
          last_name: ln,
          password: hash,
        },
      }).catch((err) => console.log(err.toJSON()));
    });
  } else {
    // if no update user data without password (means password remains as it is)
    api({
      method: "patch",
      url: `https://api.baserow.io/api/database/rows/table/47848/${id}/?user_field_names=true`,
      data: {
        first_name: fn,
        last_name: ln,
      },
    }).catch((err) => console.log(err.toJSON()));
  }
};

exports.postPay = async (c, l, o, m, id) => {
  // get all user data and filter by user id
  const getdetails = await allUserData((data) => {
    return data.filter((f) => {
      return f.id === id;
    });
  });

  // get all payroll data and filter by user id
  const payrollcontent = await allPayroll((data) => {
    return data.filter((f) => {
      return f.id === getdetails[0].payroll[0].id;
    });
  });

  // get user salary from filtered payroll var (data)
  const userobj = payrollcontent[0].salary;
  // parse to json format because it return json string, convert to js readable object
  let pasreddata = JSON.parse(userobj);

  // totaling entered claims, leaves, others and deduction by admin
  total = +c + +l + +o - +m;

  // get existing additional value
  let gettotal = +pasreddata.additional;

  // parsed and update into JSON Object
  pasreddata = { ...pasreddata, additional: gettotal + total };

  // update the user's salary field (additional amount field is in salary field as JSON Object)
  api({
    method: "patch",
    url: `https://api.baserow.io/api/database/rows/table/47849/${getdetails[0].payroll[0].id}/?user_field_names=true`,
    data: {
      // convert json to string because the row's data type is string
      salary: JSON.stringify(pasreddata),
    },
  });
};
