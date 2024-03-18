const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not exist!",
      });
      return;
    }

    const same = await bcrypt.compare(password, user.password);
    if (!same) {
      res.status(401).json({
        success: false,
        message: "Invalidate password!",
      });
      return;
    }

    req.session.userId = user._id;
    res.status(200).json({
      success: true,
      message: "Login successfully!",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.status(200).send({
      success: true,
    });
  });
};
