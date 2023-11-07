const express = require("express");
const passport = require("passport");

require("../router/googleAuth");
const googleAuth = require("../controllers/googleAuthController");
const auth = require("../middleware/auth");

const { validateSignUp, validateLogin } = require("../middleware/validateUser");
const loginController = require("../controllers/loginController");

const router = express.Router();

// NEW USER SIGN UP
router.route("/signup").post(validateSignUp, loginController.signup);

// USER LOGIN
router.route("/login").post(validateLogin, loginController.login);

// VERIFY USER
router.route("/verify/:slug").get(loginController.verifyUser);

// SEARCH USER FOR ADDING EDITORS
router.route("/getUser/:searchTerm").get(auth, loginController.searchUser);

// GOOGLE LOGIN
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.route("/auth/google/callback").get(
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/user/fail",
  }),
  googleAuth
);

router.get("/fail", (req, res) => {
  res.send({ msg: "failed" });
});

module.exports = router;
