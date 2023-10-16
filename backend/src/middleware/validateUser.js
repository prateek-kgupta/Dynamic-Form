const validator = require("validator");

const validateSignUp = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !password || !email) {
      throw new Error({ message: "Empty fields" });
    } else if (password.length < 7 || password.length > 20) {
      throw new Error({ message: "Password must be 7 to 20 characters long" });
    } else if (!validator.isEmail(email)) {
      throw new Error({ message: "Email is invalid" });
    } else {
      next();
    }
  } catch (e) {
    res.status(400).send(e);
  }
};

const validateLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new Error({ message: "Empty fields" });
    } else if (
      !validator.isEmail(email) ||
      password.length < 7 ||
      password.length > 20
    ) {
      throw new Error({ message: "Invalid Credentials" });
    } else {
      next();
    }
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = {validateSignUp, validateLogin};
