const Chat = require("../models/chat");
const Form = require("../models/forms");
const Response = require("../models/responses");

const mongoose = require("mongoose");
const User = require("../models/users");

const formController = {
  addNewForm: async (req, res) => {
    const form = new Form(req.body);
    try {
      const result = await form.save();
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
  },

  getFormInformation: async (req, res) => {
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
  },

  getFormForResponse: async (req, res) => {
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
  },

  getFormToEdit: async (req, res) => {
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
      let result;
      if (!form[0]) {
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
      await Form.findByIdAndUpdate(formId, {
        $set: { editStatus: { isEditing: true, editor: req.user._id } },
      });
      res.send(result);
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  },

  editForm: async (req, res) => {
    const condition = {
      _id: req.params.formId,
      "editStatus.editor": req.user._id,
    };
    const update = {
      $set: { ...req.body, editStatus: { isEditing: false, editor: null } },
    };
    try {
      const result = await Form.updateOne(condition, update);
      res.send(condition);
    } catch (e) {
      res.status(400).send(e);
    }
  },

  changeEditStatus: async (req, res) => {
    const formId = new mongoose.Types.ObjectId(req.params.formId);
    try {
      const result = await Form.findOneAndUpdate(
        { _id: formId, "editStatus.editor": req.user._id },
        { $set: { editStatus: { isEditing: false, editor: null } } },
        { new: true }
      );
      res.send("Done");
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  },

  changeFormStatus: async (req, res) => {
    const status = req.body.status;
    try {
      const result = await Form.updateOne(
        { _id: req.params.formId },
        { $set: { status } }
      );
      res.send(result);
    } catch (e) {
      res.status(400).send(e);
    }
  },

  deleteForm: async (req, res) => {
    try {
      const form = await Form.findOneAndDelete({
        _id: req.params.formId,
        owner: req.user._id,
      });
      if (form) {
        await Response.deleteMany({ formId: req.params.formId });
        await Chat.findOneAndDelete({ roomId: req.params.formId });
        await User.updateMany(
          {},
          { $pull: { notifications: { roomId: req.params.formId } } }
        );
      } else {
        return res.status(400).send({ message: "Invalid Request" });
      }
      return res.send({ message: "Deleted" });
    } catch (e) {
      res.status(400).send(e);
    }
  },
};

module.exports = formController;
