const express = require("express");
const userController = require("../controller/user");
const route = express.Router();

route.get("/logen", userController.getLogen);

route.get("/att", userController.getAtt);

route.get("/", userController.getHome);

route.get("/login", userController.getLogin);

route.get('/logout', userController.getLogout)

module.exports = route;