const axios = require("axios");

const api = axios.create({
  baseURL: "https://api.baserow.io/api/",
  headers: {
    Authorization: `Token ${process.env.THE_KEY}`,
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

exports.getDetailsByUsername = (username, cb) => {
  allUserData(data => {
    cb(data.filter((res) => res.username === username))
  }).catch(err => console.log(err))
};

exports.postNewUser = (
  fname,
  lname,
  uname,
  dob,
  gender,
  position,
  salary,
  userRole
) => {
  const idn = Math.floor(1000 + Math.random() * 9000);
  const mail = uname + "@yopmail.com";

  function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    return --age;
  }

  api({
    method: "post",
    url: "database/rows/table/47848/?user_field_names=true",
    data: {
      idnum: idn,
      username: uname,
      password: "password123",
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
  });
};

exports.patchUserPassword = (row_id, password, cb) => {
  return api({
    method: "patch",
    url: `database/rows/table/47848/${row_id}/?user_field_names=true`,
    data: {
      password: password,
      ftl: false,
    },
  })
    .then(cb(data))
    .catch((err) => console.log(err));
};

exports.getClockInOutByUser = (username, cb) => {
  return api({
    method: "GET",
    url: "database/rows/table/47850/?user_field_names=true"
  })
    .then((data) => cb(data.data.results.filter(atts => atts.username === username)))
    .catch((err) => console.log(err));

}

exports.postClockIn = (username, id, reason_in) => {
  const now = new Date();
  if (reason_in) {
    return api({
      method: "POST",
      url: "database/rows/table/47850/?user_field_names=true",
      data: {
        username: username,
        userId: [id],
        in: now.today,
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
        in: now.toISOString(),
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
    url: "database/rows/table/47850/?user_field_names=true"
  })
    .then((data) => {
      const filteredData = data.data.results.filter(val => val.username === username)
      if (reason_out) {
        return api({
          method: "patch",
          url: `database/rows/table/47850/${filteredData[filteredData.length - 1].id}/?user_field_names=true`,
          data: {
            out: now.toISOString(),
            reason_out: reason_out
          }
        })
      } else {
        return api({
          method: "patch",
          url: `database/rows/table/47850/${filteredData[filteredData.length - 1].id}/?user_field_names=true`,
          data: {
            out: now.toISOString(),
            reason_out: ""
          }
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.postClaim = (userid, typeofclaim, amounts, justify, thefile, tagging) => {
  const idn = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  return api({
    method: "POST",
    url: "database/rows/table/47872/?user_field_names=true",
    data: {
      claim_id: idn,
      userId: userid,
      date: now.toISOString(),
      amount: amounts,
      justification: justify,
      attachment: [{ "name": thefile }],
      status: "pending",
      toc: typeofclaim,
      tag: tagging,
    }
  }).catch(err => console.error(err))
}

exports.getPayroll = (cb) => {
  api({
    method: "GET",
    url: "database/rows/table/47849/?user_field_names=true",
  }).then(data => { cb(data.data.results) }).catch(err => console.log(err))
}