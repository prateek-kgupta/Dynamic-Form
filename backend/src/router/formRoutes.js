const express = require("express");
const mongoose = require("mongoose");

const Form = require("../models/forms");
const Response = require("../models/responses");
const auth = require("../middleware/auth");
const { validateForm } = require("../middleware/validateForm");
const Chat = require("../models/chat");

const router = express.Router();

// router.use(auth);

// ADD NEW FORM
router.post("/", auth, validateForm, async (req, res) => {
  const form = new Form(req.body);
  try {
    const result = await form.save();
    console.log(result);
    const author = result.owner;
    const roomName = result.title;
    const roomId = result._id;
    const chat = new Chat({
      roomId,
      roomName,
      author,
      subscribedUsers: [author],
      chat: [],
    });
    await chat.save();
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
          as: "user",
        },
      },
      {
        $project: {
          _id: 1,
          owner: 1,
          title: 1,
          editors: 1,
          status: 1,
          numberOfQues: { $size: "$form" },
          "user.name": 1,
        },
      },
    ]);
    res.send(forms);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:formId", auth, async (req, res) => {
  let searchQuery = { _id: req.params.formId, status: "Active" };

  try {
    const form = await Form.findOne(searchQuery);
    if (!form) {
      return res.status(404).send({ message: "No data found" });
    }
    return res.send(form);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// FORM DETAILS FOR EDITING
router.get("/edit/:formId", auth, async (req, res) => {
  const formId = new mongoose.Types.ObjectId(req.params.formId);
  try {
    const form = await Form.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "editors",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $match: {
          _id: formId,
          $or: [{ owner: req.user._id }, { editors: req.user._id }],
          status: "Draft",
        },
      },
      {
        $project: {
          _id: 1,
          owner: 1,
          form: 1,
          title: 1,
          isEditing: "$editStatus.isEditing",
          editors: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
        },
      },
    ]);
    console.log("Hello this is form to be edited", form);
    let result;
    if (!form[0]) {
      console.log(form[0]);
      return res.status(404).send({ message: "No data found" });
    }
    if (form[0].isEditing) {
      return res.status(403).send({
        message: "Unable to perform this action. Please try again later!!!",
      });
    }
    if (form[0].owner.toString() === req.user._id.toString()) {
      // Owner
      result = { ...form[0], editors: form[0].user, isOwner: true };
      delete result["user"];
    } else {
      // Editor
      result = { ...form[0], isOwner: false };
      delete result["user"];
    }
    console.log("Hello this is response to be sent", result);
    await Form.findByIdAndUpdate(formId, {
      $set: { editStatus: { isEditing: true, editor: req.user._id } },
    });
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

// UPDATING THE EDITED FORM
router.patch("/edit/:formId", auth, async (req, res) => {
  const condition = { _id: req.params.formId, "editStatus.editor": req.user._id };
  const update = {
    $set: { ...req.body, editStatus: { isEditing: false, editor: null } },
  };
  console.log(update, "\n\n", condition);
  try {
    const result = await Form.updateOne(condition, update);
    res.send(condition);
  } catch (e) {
    res.status(400).send(e);
  }
});

// IF FORM CLOSES WHILE EDITING
router.get("/editFailed/:formId", auth, async (req, res) => {
  console.log("Calling edit failed");
  const formId = new mongoose.Types.ObjectId(req.params.formId);
  try {
    const result = await Form.findOneAndUpdate(
      { _id: formId, "editStatus.editor": req.user._id },
      { $set: { editStatus: { isEditing: false, editor: null } } },{new: true}
    );
    res.send("Done");
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.patch("/editStatus/:formId", auth, async (req, res) => {
  const status = req.body.status;
  try {
    const result = await Form.updateOne(
      { _id: req.params.formId },
      { $set: { status } }
    );
    console.log(result);
    res.send(result);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/delete/:formId", auth, async (req, res) => {
  try {
    const form = await Form.findOneAndDelete({
      _id: req.params.formId,
      owner: req.user._id,
    });
    console.log(form);
    if (form) {
      await Response.deleteMany({ formId: req.params.formId });
      await Chat.findOneAndDelete({ roomId: req.params.formId });
    } else {
      return res.status(400).send({ message: "Invalid Request" });
    }
    return res.send({ message: "Deleted" });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
