const mongoose = require("mongoose");

const url =process.env.URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("Connected Succesfully");
  })
  .catch((err) => {
    console.log(err);
  });
