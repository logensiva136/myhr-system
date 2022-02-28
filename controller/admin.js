const db = require("../models/userdb")


exports.getLogin = (req, res, next) => {
    res.render("login")
}
exports.postLogin = (req, res, next) => {
    db.adminLogin("logen", "logen");

}

// exports.postLogin = (req, res, next) => {

// }