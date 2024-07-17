exports.isLogin = async (req, res, next) => {
  try {
    if (res.session.user) {
    } else {
      res.redirect("/");
    }
    next();
  } catch (err) {
    res.status(200).json({
      status: "fail",
      message: err,
    });
  }
};
exports.isLogout = async (req, res, next) => {
  try {
    if (res.session.user) {
      res.redirect("/dashboard");
    }
    next();
  } catch (err) {
    res.status(200).json({
      status: "fail",
      message: err,
    });
  }
};
