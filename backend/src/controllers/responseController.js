const Form = require("../models/forms");
const Response = require("../models/responses");

const { responseMail } = require("../mailer");

const mongoose = require("mongoose");

const responseController = {
  submitResponse: async (req, res) => {
    const responseData = req.body;
    responseData.responderId = req.user._id;
    const formStatus = await Form.findById(responseData.formId).select({
      status: 1,
      _id: 0,
    });
    if (formStatus.status !== "Active") {
      res
        .status(400)
        .send({ message: "This form is not accepting any submissions" });
    }
    const response = new Response(responseData);
    try {
      const result = await response.save();
      const email = req.user.email;
      if (result) {
        const mailStatus = responseMail(email);
      }
      res.status(200).send(result);
    } catch (e) {
      res.status(400).send(e);
    }
  },

  getResponseById: async (req, res) => {
    const responseId = new mongoose.Types.ObjectId(req.params.responseId);
    const seekerId = req.user._id;
    try {
      const result = await Response.aggregate([
        {
          $lookup: {
            from: "forms",
            localField: "formId",
            foreignField: "_id",
            as: "forms",
          },
        },
        {
          $match: {
            $or: [{ "forms.owner": seekerId }, { responderId: seekerId }],
            _id: responseId,
          },
        },
        {
          $project: {
            responses: 1,
            formId: 1,
            responderId: 1,
            "forms.form": 1,
            "forms.title": 1,
            "forms.owner": 1,
          },
        },
      ]);

      if (result.length === 0) {
        return res.status(404).send();
      }
      return res.status(200).send(result);
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  },

  getResponsesInfo: async (req, res) => {
    const formId = new mongoose.Types.ObjectId(req.params.formId);
    const seekerId = req.user._id;
    try {
      const result = await Response.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "responderId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "forms",
            localField: "formId",
            foreignField: "_id",
            as: "form",
          },
        },
        {
          $match: {
            formId: formId,
            "form.owner": seekerId,
          },
        },
        {
          $project: {
            _id: 1,
            formId: 1,
            "user.name": 1,
            timestamp: 1,
          },
        },
      ]);
      res.status(200).send(result);
    } catch (e) {
      res.status(400).send(e);
    }
  },

  getEveryResponse: async (req, res) => {
    const formId = new mongoose.Types.ObjectId(req.params.formId);
    const seekerId = req.user._id;

    try {
      const result = await Response.aggregate([
        {
          $lookup: {
            from: "forms",
            localField: "formId",
            foreignField: "_id",
            as: "forms",
          },
        },
        { $unwind: "$forms" },
        {
          $lookup: {
            from: "users",
            localField: "responderId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: {
            "forms.owner": seekerId,
            formId: formId,
          },
        },
        {
          $project: {
            "responses.response": 1,
            formName: "$forms.title",
            "forms.form.ques": 1,
            "forms.form.options": 1,
            "forms.form.type": 1,
            title: "$forms.title",
            name: "$user.name",
            email: "$user.email",
          },
        },
      ]);

      if (result.length === 0) {
        return res.status(404).send();
      }
      const sheetData = { responses: [], title: result[0].title };
      sheetData.headings = ["Name", "Email"];
      const dataType = [];
      const options = [];
      for (const quesDetails of result[0].forms.form) {
        sheetData.headings.push(quesDetails.ques);
        dataType.push(quesDetails.type);
        options.push(quesDetails.options);
      }
      for (const i in result) {
        const responseData = result[i];
        sheetData.responses.push([]);
        const currentResponse = sheetData.responses[i];
        currentResponse.push(responseData.name);
        currentResponse.push(responseData.email);
        for (const j in responseData.responses) {
          if (dataType[j] === "checkbox") {
            const ans = [];
            const response = responseData.responses[j].response;
            for (const k in options[j]) {
              if (response[k] === "true") {
                ans.push(options[j][k]);
              }
            }
            currentResponse.push(ans);
          } else {
            currentResponse.push(responseData.responses[j].response);
          }
        }
      }
      return res.status(200).send(sheetData);
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  },
};

module.exports = responseController;
