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