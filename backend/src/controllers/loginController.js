const User = require("../models/users");
const uuid = require("uuid");
const { verificationMail } = require("../mailer");

const bcrypt = require("bcryptjs");

const loginController = {
  signup: async (req, res) => {
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
  },

  login: async (req, res) => {
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
  },

  verifyUser: async (req, res) => {
    const slug = req.params.slug;
    try {
      const result = await User.findOneAndUpdate(
        { slug },
        { $set: { slug: "", isVerified: true } },
        { new: true, runValidators: true }
      );
      if (result) {
        res.status(200).send({ message: "success" });
      } else {
        res.status(404).send({ message: "Not found" });
      }
    } catch (e) {
      res.status(400).send(e);
    }
  },

  searchUser: async (req, res) => {
    const searchTerm = req.params.searchTerm;
    try {
      const result = await User.find({
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
      }).select("_id name email");
      res.send(result);
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  },
};

module.exports = loginController;
