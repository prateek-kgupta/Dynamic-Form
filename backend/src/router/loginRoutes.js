const express = require("express");
const passport = require("passport");
const uuid = require("uuid");

const User = require("../models/users");
const { validateSignUp, validateLogin } = require("../middleware/validateUser");
const { verificationMail } = require("../mailer");
require("../router/googleAuth");

const auth = require("../middleware/auth");

const bcrypt = require("bcryptjs");

const router = express.Router();

router.post("/signup", validateSignUp, async (req, res) => {
  console.log("Sign up now");
  const user = new User(req.body);
  user.password = await bcrypt.hash(user.password, 8);
  user.slug = uuid.v4();
  user.isVerified = false;
  try {
    await user.save();
    // Mail slug to the email id provided by user
    const mailStatus = verificationMail(user.slug, user.email, user.name);
    console.log(mailStatus);
    res.status(201).send({ message: "Success" });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/login", validateLogin, async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    if (!user.isVerified) {
      return res.status(403).send({ message: "Verify account" });
    }
    const token = await user.generateAuthToken();
    res.send({ _id: user.id, name: user.name, email: user.email, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/verify/:slug", async (req, res) => {
  const slug = req.params.slug;
  console.log(slug);
  try {
    const result = await User.findOneAndUpdate(
      { slug },
      { $set: { slug: "", isVerified: true } },
      { new: true, runValidators: true }
    );
    console.log(result);
    if (result) {
      res.status(200).send({ message: "success" });
    } else {
      res.status(404).send({ message: "Not found" });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/user/fail",
  }),
  async function (req, res) {
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
      console.log(process.env.FRONTEND_URL);
      try {
        await user.save();
        const token = await user.generateAuthToken();
        console.log(token);
        console.log(process.env.FRONTEND_URL);
        res.redirect(`${process.env.FRONTEND_URL}/middler/${token}`);
      } catch (e) {
        res.redirect("/user/fail");
      }
    }
  }
);

router.get("/fail", (req, res) => {
  res.send({ msg: "failed" });
});

// Fetching author information, needs authorization

router.use(auth);
router.get("/getUser/:searchTerm", async (req, res) => {
  const searchTerm = req.params.searchTerm;
  try {
    const result = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    }).select("_id name email");
    console.log(result);
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
