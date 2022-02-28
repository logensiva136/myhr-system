const express = require('express')
const adminContoller = require("../controller/admin");
const route = express.Router();


// route.get("/", adminContoller.getHome);

route.get("/login", adminContoller.getLogin);
route.post("/login", adminContoller.postLogin);

// route.get('/logout', adminContoller.getLogout)

module.exports = route;