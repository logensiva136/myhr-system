const axios = require("axios");

const api = axios.create({
  baseURL: "https://api.baserow.io/api/",
  headers: {
    Authorization: `Token ${process.env.THE_KEY}`,
  },
});

const allUserData = () => {
  return api({
    method: "GET",
    url: "database/rows/table/47848/?user_field_names=true",
  })
    .then((data) => data.data.results)
    .catch((err) => console.log(err));
};

exports.getDetailsByUsername = (username) => {
  return allUserData().then((data) =>
    data.filter((res) => res.username === username)
  );
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
    url: "https://api.baserow.io/api/database/rows/table/47848/?user_field_names=true",
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

exports.patchUserPassword = (row_id, password) => {
  return api({
    method: "patch",
    url: `https://api.baserow.io/api/database/rows/table/47848/${row_id}/?user_field_names=true`,
    data: {
      password: password,
      ftl: false,
    },
  })
    .then((data) => data)
    .catch((err) => console.log(err));
};

exports.getUserAtt = (username) => {
  return api({
    method: "GET",
    url: `https://api.baserow.io/api/database/rows/table/47850/?user_field_names=true`,
  })
    .then((data) => {
      return data.data.results;
    })
    .catch((err) => console.log(err));
};

exports.postClockIn = (username, id, reason_in) => {
  const now = new Date();
  if (reason_in) {
    return api({
      method: "POST",
      url: "https://api.baserow.io/api/database/rows/table/47850/?user_field_names=true",
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
      url: "https://api.baserow.io/api/database/rows/table/47850/?user_field_names=true",
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
