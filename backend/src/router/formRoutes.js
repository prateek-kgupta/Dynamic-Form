const express = require("express");

const auth = require("../middleware/auth");
const { validateForm } = require("../middleware/validateForm");
const formController = require("../controllers/formController");

const router = express.Router();

// ADD NEW FORM
router.route("/").post(auth, validateForm, formController.addNewForm);

// GET ALL FORMS WITH NUMBER OF QUESTIONS AND AUTHOR NAME
router.route("/").get(formController.getFormInformation);

// GET FORM FOR RESPONSE SUBMISSION
router.route("/:formId").get(auth, formController.getFormForResponse);

// FORM DETAILS FOR EDITING
router.route("/edit/:formId").get(auth, formController.getFormToEdit);

// UPDATING THE EDITED FORM
router.route("/edit/:formId").patch(auth, formController.editForm);

// IF FORM CLOSES WHILE EDITING
router.route("/editFailed/:formId").get(auth, formController.changeEditStatus);

// CHANGE FORM STATUS
router
  .route("/editStatus/:formId")
  .patch(auth, formController.changeFormStatus);

// DELETE FORM
router.route("/delete/:formId").delete(auth, formController.deleteForm);

module.exports = router;
