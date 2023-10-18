const express = require("express");
const passport = require("passport");
const uuid = require("uuid");

const User = require("../models/users");
const { validateSignUp, validateLogin } = require("../middleware/validateUser");
require("../router/googleAuth");

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
    const token = await user.generateAuthToken();
    console.log(token);
    res
      .status(201)
      .send({ _id: user.id, name: user.name, email: user.email, token });
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
      res.status(200).send({message: "success"});
    } else {
      res.status(404).send({message: "Not found"})
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

module.exports = router;
