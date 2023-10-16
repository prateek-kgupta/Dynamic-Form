const express = require("express");
const Form = require("../models/forms");
const auth = require("../middleware/auth");
const { validateForm } = require("../middleware/validateForm");

const router = express.Router();

// router.use(auth);

// ADD NEW FORM
router.post("/",auth, validateForm, async (req, res) => {
  const form = new Form(req.body);
  try {
    const result = await form.save();
    res.status(201).send(result);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET ALL FORMS WITH NUMBER OF QUESTIONS AND AUTHOR NAME
router.get("/", async (req, res) => {
  try {
    const forms = await Form.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "user"
        },
      },
      {
        $project: {
          _id: 1,
          owner: 1,
          title: 1,
          numberOfQues: { $size: '$form' },
          "user.name": 1
        }
      }
    ]);
    res.send(forms)
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/user/:userId",auth, async (req, res) => {
  // Get all forms created by an user

  // Update the query for grouping forms by id and getting number of questions and author name
  try {
    const forms = await Form.find({ owner: req.params.userId });
    res.send(forms);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:formId",auth, async (req, res) => {
  try {
    console.log(req.params.formId);
    const form = await Form.findOne({ _id: req.params.formId });
    res.send(form);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
