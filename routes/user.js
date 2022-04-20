const express = require("express");
const userController = require("../controller/user");
const route = express.Router();
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' })

route.get("/att", userController.getAtt);
route.post("/att", userController.postAtt);

route.get("/", userController.getHome);

route.get("/login", userController.getLogin);
route.post("/login", userController.postLogin);

route.get("/forgot", userController.getForgot);
route.post("/forgot", userController.postForgot);

route.get("/logout", userController.getLogout);

route.get("/addUser", userController.getAddUser);
route.post("/addUser", userController.postAddUser);

route.get("/eleave", userController.getEleave);
// route.post('/eleave', userController.postEleave)

route.get("/sp", userController.getSP);

route.get("/eclaim", userController.getClaim);
route.post("/eclaim", userController.postClaim);

route.get("/setting", userController.getSetting);
// route.post('/eclaim', userController.postSetting)

route.get("/401", userController.au);

route.get("/cp", userController.getCP);
route.post("/cp", userController.postCP);

route.get("/payroll", userController.getPay);
// route.post("/payroll", userController.postPay);

module.exports = route;
