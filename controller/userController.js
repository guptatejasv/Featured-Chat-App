const User = require("./../models/userModel");
const Chat = require("./../models/chatModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("./../middleware/nodemailer");
exports.signupLoad = async (req, res) => {
  try {
    res.render("register");
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    const user = new User({
      name,
      email,
      password,
      passwordConfirm,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    // console.log(user);

    await user.save();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "VibeWire: Registration Successful!",
      text: `Your registration at VibeWire Chat App is completed successfully.\nEnjoy the Vibe, Share the Wire..😉`,
    });
    res.redirect("/");
    // res.status(201).json({
    //   status: "success",
    //   token,
    //   user,
    // });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
    console.log(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email }).select("+password");

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      console.log(passwordMatch);
      if (passwordMatch) {
        req.session.user = userData;
        res.redirect("/dashboard");
      } else {
        res.render("login", { message: "Email or password is incorrect" });
      }
    } else {
      res.render("login", { message: "There is no user with this email" });
    }
    // console.log(user);

    // if (await User.correctPassword(password, user.password)) {
    //   req.session.user = userData;
    //   res.redirect("/dashboard");
    // } else {
    //   res.render("login", { message: "Email and password is incorrect" });
    // }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
exports.dashboard = async (req, res) => {
  try {
    var users = await User.find({ _id: { $nin: [req.session.user._id] } });
    res.render("dashboard", { user: req.session.user, users: users });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
exports.logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.saveChat = async (req, res) => {
  try {
    var chat = new Chat({
      sender_id: req.body.sender_id,
      receiver_id: req.body.receiver_id,
      message: req.body.message,
    });

    const newChat = await chat.save();
    res.status(200).send({
      status: "success",
      msg: "Chat Inserted Successfully",
      data: newChat,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "You are not logged in..." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "You are not logged in..." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    // Check if User still exists
    const freshUser = await User.findById(decoded.id);
    console.log();
    if (!freshUser) {
      return res.status(401).json({
        status: "fail",
        message: "The User belonging to this token no longer exists",
      });
    }
    //  check if user changed password after the token was issued---------
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
