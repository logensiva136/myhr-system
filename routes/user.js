const express = require("express");
const userController = require("../controller/user");
const route = express.Router();

route.get("/logen", userController.getLogen);

route.get("/att", userController.getAtt);

route.get("/", userController.getHome);

route.get("/login", userController.getLogin);

route.post("/login", userController.postLogin);

route.get("/forgot", userController.getForgot);

route.post("/forgot", userController.postForgot);

route.get('/logout', userController.getLogout)

route.get('/addUser', userController.getAddUser)

route.get('/eleave', userController.getEleave)

module.exports = route;