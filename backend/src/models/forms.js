const mongoose = require("mongoose");
// const User = require('./users')

const formSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
   status: {
    type: String,
    trim: true,
  },
  editors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  form: [
    {
      ques: {
        type: String,
        required: true,
        trim: true,
      },
      type: {
        type: String,
        required: true,
        trim: true,
      },
      isRequired: {
        type: Boolean,
        default: false,
        required: true,
      },
      options: [String],
    },
  ],
 
  
});

formSchema.virtual("responsesForQues", {
  ref: "Response",
  localField: "_id",
  foreignField: "formId",
});

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
