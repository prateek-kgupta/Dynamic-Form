const express = require("express");
const auth = require("../middleware/auth");
const Response = require("../models/responses");
const mongoose = require("mongoose");

const { validateResponse } = require("../middleware/validateResponse");

const router = express.Router();
router.use(auth);

router.post("/", validateResponse, async (req, res) => {
  const responseData = req.body;
  responseData.responderId = req.user._id;
  const response = new Response(responseData);
  try {
    const result = await response.save();
    res.status(200).send(result);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/:responseId", async (req, res) => {
  const responseId = new mongoose.Types.ObjectId(req.params.responseId);
  const seekerId = req.user._id;
  console.log(responseId, "\n", seekerId);

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

    console.log(result);
    if (result.length === 0) {
      return res.status(404).send();
    }
    return res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
