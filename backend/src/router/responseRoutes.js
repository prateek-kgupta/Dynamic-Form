const express = require("express");
const auth = require("../middleware/auth");
const Response = require("../models/responses");
const mongoose = require("mongoose");
const { responseMail } = require("../mailer");

const { validateResponse } = require("../middleware/validateResponse");
const responseController = require("../controllers/responseController");

const router = express.Router();

// AUTHENTICATION REQUIRED
router.use(auth);

// SUBMIT RESPONSE
router.route("/").post(validateResponse, responseController.submitResponse);

// GET RESPONSE
router.route("/:responseId").get(responseController.getResponseById);

// GET INFORMATION OF RESPONSES TO A FORM
router.route("/responses/:formId").get(responseController.getResponsesInfo);

// GET ALL RESPONSES TO A FORM TO DISPLAY SHEET
router.route("/allResponses/:formId").get(responseController.getEveryResponse);

module.exports = router;
