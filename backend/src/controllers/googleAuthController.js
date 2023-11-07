const User = require("../models/users");

const googleAuth = async (req, res) => {
  const { displayName: name, email } = req.user;
  const user = await User.findOne({ email });
  if (user) {
    try {
      const token = await user.generateAuthToken();
      res.redirect(`${process.env.FRONTEND_URL}/middler/${token}`);
    } catch (e) {
      res.redirect("/user/fail");
    }
  } else {
    const password = uuid.v4();
    const slug = "";
    const isVerified = true;
    const user = new User({ name, password, email, slug, isVerified });
    try {
      await user.save();
      const token = await user.generateAuthToken();
      res.redirect(`${process.env.FRONTEND_URL}/middler/${token}`);
    } catch (e) {
      res.redirect("/user/fail");
    }
  }
};

module.exports = googleAuth;
