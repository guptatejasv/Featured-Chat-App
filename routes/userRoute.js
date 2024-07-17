const express = require("express");
const user_route = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const auth = require("./../middleware/auth");
user_route.use(session({ secret: process.env.SESSION_SECRET }));

const path = require("path");
const userController = require("./../controller/userController");

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

user_route.set("view engine", "ejs");
user_route.set("views", "./views");

user_route.use(express.static("public"));
const multer = require("multer");

user_route.get("/register", userController.signupLoad);
user_route.post("/register", userController.signup);

user_route.get("/", userController.loginLoad);
user_route.post("/", userController.login);
user_route.get("/logout", userController.logout);

user_route.get("/dashboard", userController.dashboard);
user_route.post("/save-chat", userController.saveChat);

user_route.get("*", function (req, res) {
  res.redirect("/");
});

module.exports = user_route;
