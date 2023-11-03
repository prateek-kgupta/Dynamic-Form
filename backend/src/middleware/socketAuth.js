const jwt = require("jsonwebtoken");
const User = require("../models/users");

const socketAuth = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

module.exports = socketAuth;
