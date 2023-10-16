const validateForm = async (req, res, next) => {
  const { owner, title, form } = req.body;
  try {
    if (!owner || !title || form.length === 0) {
      throw new Error({ message: "Empty fields" });
    } else if (form) {
      form.forEach((field) => {
        const { ques, type, isRequired, options } = field;
        if (!ques || !type || isRequired === null) {
          throw new Error({ message: "Invalid form data" });
        } else if (options.length > 0) {
          for (let option of options) {
            if (typeof option !== "string") {
              throw new Error({ message: "Invalid Data" });
            }
          }
        }
      });
    }
    next();
  } catch (e) {
    res.status(400).send(e);
  }
};
module.exports = { validateForm };
