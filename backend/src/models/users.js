const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  }
});

userSchema.virtual("forms", {
  ref: "Form",
  localField: "_id",
  foreignField: "owner",
});

userSchema.virtual("responses", {
  ref: "Response",
  localField: "_id",
  foreignField: "responderId",
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString(), name: user.name }, process.env.SECRET_KEY);
  return token;
};


userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
