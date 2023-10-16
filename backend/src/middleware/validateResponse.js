const validateResponse = async (req, res, next) => {
  const { formId, responses } = req.body;
  try {
    if (!formId) {
      throw new Error({ message: "Empty fields" });
    } else if (responses) {
      responses.forEach((item) => {
        const { questionId, response } = item;
        if (!questionId) {
          throw new Error({ message: "Invalid data" });
        } else if (response.length > 1) {
          for (let resData of response) {
            if (![true, false, "true", "false"].includes(resData)) {
              throw new Error({ message: "Invalid Data" });
            }
          }
        } else if (response.length === 1) {
          if (response[0] && typeof response[0] !== "string") {
            throw new Error({ message: "Invalid Data" });
          }
        }
      });
    }
    next();
  } catch (e) {
    res.status(400).send(e);
  }
};
module.exports = { validateResponse };
