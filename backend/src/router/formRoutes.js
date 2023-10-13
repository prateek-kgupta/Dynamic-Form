const express = require("express");
const Form = require("../models/forms");
// const uuid  = require("uuid");
const auth = require('../middleware/auth')

const router = express.Router();

router.use(auth)

// ADD NEW FORM
router.post("/", async (req, res) => {
  // const { owner, form } = req.body;
  // const formId = uuid.v4();
  // for (let field of formData) {
  //   field.formId = formId;
  //   field.owner = owner;
  // }
  const form = new Form(req.body)
  try {
    // const response = await Form.insertMany(formData);
    const result = await form.save()
    res.status(201).send(result);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET ALL FORMS WITH NUMBER OF QUESTIONS
router.get("/", async (req, res) => {

  try {
    const forms = await Form.aggregate([
      {
        $group: {
          _id: "$formId", // Group by the 'formId' field
          count: { $sum: 1 }, // Count the number of documents in each group
        },
      },
    ]);
    res.send(forms);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/user/:userId", async (req, res) => {
  // Get all forms created by an user

  // Update the query for grouping forms by id and getting number of questions and author name
  try {
    const forms = await Form.find({ owner: req.params.userId });
    res.send(forms);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:formId", async (req, res) => {
  try {
    console.log(req.params.formId)
    const form = await Form.findOne({ _id: req.params.formId });
    res.send(form);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
