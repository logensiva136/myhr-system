const axios = require("axios");
const res = require("express/lib/response");
const moment = require("moment");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const api = axios.create({
  baseURL: "https://api.baserow.io/api/",
  headers: {
    Authorization: `Token ${process.env.THE_KEY}`,
    Connection: "close",
  },
});

const allUserData = (cb) => {
  return api({
    method: "GET",
    url: "database/rows/table/47848/?user_field_names=true",
  })
    .then((data) => cb(data.data.results))
    .catch((err) => console.log(err));
};

const allPayroll = (cb) => {
  return api({
    method: "GET",
    url: "database/rows/table/47849/?user_field_names=true",
  })
    .then((data) => cb(data.data.results))
    .catch((err) => console.log(err));
};

exports.listUsers = () => {
  return allUserData((data) => {
    return data;
  });
};

exports.getDetailsByUsername = (username, cb) => {
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
  // setting random id number
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

  // salting password

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
      ftl: true,
    },
  }).catch((err) => {
    console.log(err.toJSON());
  });
};

exports.patchUserPassword = (row_id, newPs, cb) => {
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
  if (reason_in) {
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
  const now = new Date();
  return api({
    method: "GET",
    url: "database/rows/table/47850/?user_field_names=true",
  })
    .then((data) => {
      const filteredData = data.data.results.filter(
        (val) => val.username === username
      );
      if (reason_out) {
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
  const idn = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
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
  // // console.log(allClaims)
  // const filterClaims = allClaims.filter(data => data.username === uname)
  // // console.log(filterClaims[0])
};

exports.getClaimByUser = (uname) => {
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
  const allClaims = await claims();
  const filteredClaims = allClaims.filter((data) => {
    return data.claim_id === claimId;
  });

  return api({
    method: "patch",
    url: `https://api.baserow.io/api/database/rows/table/47872/${filteredClaims[0].id}/?user_field_names=true`,
    data: {
      status: "approved",
    },
  });
};

exports.patchRejectedClaim = async (claimId) => {
  const allClaims = await claims();
  const filteredClaims = allClaims.filter((data) => {
    return data.claim_id === claimId;
  });

  return api({
    method: "patch",
    url: `https://api.baserow.io/api/database/rows/table/47872/${filteredClaims[0].id}/?user_field_names=true`,
    data: {
      status: "rejected",
    },
  });
};

exports.getPayroll = () => {
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
  const payidn = Math.floor(1000 + Math.random() * 9000);
  api({
    method: "post",
    url: "database/rows/table/47849/?user_field_names=true",
    data: {
      idnum: payidn,
      salary: JSON.stringify({ salary: salary }),
      user: [row_id],
    },
  });
};

const leaves = () => {
  return api({
    url: "https://api.baserow.io/api/database/rows/table/57611/?user_field_names=true",
  }).then((data) => data.data.results);
};

exports.getLeaves = async () => {
  return api({
    url: "https://api.baserow.io/api/database/rows/table/57611/?user_field_names=true",
  }).then((data) => data.data.results);
};

exports.postLeaves = async (tol, sd, ed, userid, leaveDuration) => {
  const allLeaves = await leaves();
  const userLeave = await allLeaves.filter((data) => {
    return data.user_id.id === userid;
  });

  let theCount;
  if (userLeave.length === 0) {
    theCount = 60;
  } else {
    theCount = userLeave[userLeave.length - 1].leave_left;
  }

  const idn = Math.floor(1000 + Math.random() * 9000);
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
      leave_left: theCount - leaveDuration,
      leave_taken:
        userLeave.length !== 0
          ? 60 - userLeave[userLeave.length - 1].leave_left
          : leaveDuration,
    },
  });
};

exports.patchApprovedLeave = async (claim_id) => {
  const allLeaves = await leaves();
  const thisClaim = allLeaves.filter((data) => {
    return data.leave_request_id === claim_id;
  });
  api({
    method: "patch",
    url: `https://api.baserow.io/api/database/rows/table/57611/${thisClaim[0].id}/?user_field_names=true`,
    data: {
      status: "approved",
    },
  }).catch((err) => {
    console.log(err.toJSON());
  });
};

exports.patchRejectedLeave = async (claim_id) => {
  const allLeaves = await leaves();
  const thisClaim = allLeaves.filter((data) => {
    return data.leave_request_id === claim_id;
  });
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
  const idn = Math.floor(1000 + Math.random() * 9000);
  api({
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
  return api({
    method: "get",
    url: "https://api.baserow.io/api/database/rows/table/61247/?user_field_names=true",
  }).catch((err) => console.log(err.toJSON()));
};

exports.patchUser = async (fn, ln, pass, id) => {
  api({
    method: "patch",
    url: `https://api.baserow.io/api/database/rows/table/47848/${id}/?user_field_names=true`,
    data: {
      first_name: fn,
      last_name: ln,
      password: pass,
    },
  }).catch((err) => console.log(err.toJSON()));
};

exports.postPay = async (c, l, o, m, id) => {
  const getdetails = await allUserData((data) => {
    return data.filter((f) => {
      return f.id === id;
    });
  });

  const payrollcontent = await allPayroll((data) => {
    return data.filter((f) => {
      return f.id === getdetails[0].payroll[0].id;
    });
  });

  const userobj = payrollcontent[0].salary;
  let pasreddata = JSON.parse(userobj);

  total = +c + +l + +o - +m;
  // delete pasreddata.additional;
  let gettotal = +pasreddata.additional;

  pasreddata = { ...pasreddata, additional: gettotal + total };
  console.log(pasreddata);

  api({
    method: "patch",
    url: `https://api.baserow.io/api/database/rows/table/47849/${getdetails[0].payroll[0].id}/?user_field_names=true`,
    data: {
      salary: JSON.stringify(pasreddata),
    },
  });
};
