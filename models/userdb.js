const axios = require("axios")

const api = axios.create({
    baseURL: 'https://api.baserow.io/api/',
    headers: {
        Authorization: `Token ${process.env.THE_KEY}`
    }
});

const allUserData = () => {
    return api({
        method: "GET",
        url: "database/rows/table/47848/?user_field_names=true"
    }).then(data => data.data.results)
}

exports.getDetailsByUsername = (username) => {
    return allUserData().then(data => data.filter(res => res.username === username))
}

exports.postNewUser = (fname, lname, uname, dob, gender, position, salary, userRole) => {
    const idn = Math.floor(1000 + Math.random() * 9000)
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
            "idnum": idn,
            "username": uname,
            "password": "password123",
            "email": mail,
            "position": position,
            "age": getAge(dob),
            "gender": gender,
            "user_role": userRole,
            "first_name": fname,
            "last_name": lname,
            "dob": dob,
            "ftl": true
        }
    })

    // exports.getRowIdByUsername = (username) => {
    //     return getDetailsByUsername(username).then(data => data[0].id);
    // }




    // ====================== //

    // post data in userdb
    // https://api.baserow.io/api/database/rows/table/47848/?user_field_names=true

    // update data in userdb (patch)
    // https://api.baserow.io/api/database/rows/table/47848/{row_id}/?user_field_names=true
}

exports.patchUserPassword = (id, password) => {
    return api({
        method: "patch",
        url: `https://api.baserow.io/api/database/rows/table/47848/${id}/?user_field_names=true`,
        data: {
            "password": password,
            "ftl": false
        }
    }).then(data => data)
}