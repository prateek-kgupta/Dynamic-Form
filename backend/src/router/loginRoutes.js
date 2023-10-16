const express = require("express");
const User = require("../models/users");
const {validateSignUp, validateLogin} = require('../middleware/validateUser')

const bcrypt = require('bcryptjs')

const router = express.Router();

router.post("/signup",validateSignUp, async (req, res) => {
  console.log("Sign up now")
  const user = new User(req.body);
  user.password = await bcrypt.hash(user.password, 8)
  console.log(user)
  try {
    await user.save();
    const token = await user.generateAuthToken();
    console.log(token)
    res.status(201).send({_id:user.id, name: user.name, email: user.email, token});
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/login",validateLogin, async (req, res) => {
  try{
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({_id:user.id, name: user.name, email: user.email, token})
  }catch(e){
    res.status(400).send(e)
  }
});

module.exports = router;
