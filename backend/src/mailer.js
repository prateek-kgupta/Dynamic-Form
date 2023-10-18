const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EPASS,
  },
});

const responseMail = (email) => {
  const mailOptions = {
    from: `"Dynamic Forms" <${process.env.EMAIL}>`,
    to: `${email}`,
    subject: "Successful Submission of form",
    text: "Congratulation! Your response to the form has been submitted successfully",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return error;
    } else {
      return "Email sent: " + info.response;
    }
  });
};

const verificationMail = (slug, email, name = "there") => {
  const mailOptions = {
    from: `"Dynamic Forms" <${process.env.EMAIL}>`,
    to: `${email}`,
    subject: "Email Verification",
    html: `
    <html>
<head>
  <style>
  div{
    padding-bottom: 5px;
  }
    h4{
      margin-bottom: 0;
    }
    a#mylink{
      text-decoration: none;
      border: 1px solid green;
      padding: 6px 15px;
      border-radius: 7px;
      color: white;
      background: green;
      width: 100%;
      
    }
    a#mylink:hover{
      background: white;
      color: green;
    }
  </style>
</head>
<body>
<div>
    <h4>Hey ${name}! Welcome to Dynamic Forms!!</h4>
  <p>Click below to verify your email and start your journey with us</p>
  <a id="mylink" href="${process.env.FRONTEND_URL}/verify/${slug}">Verify Now</a>
  <div>
</body>
</html>
    `,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return error;
    } else {
      return "Email sent: " + info.response;
    }
  });
};

module.exports = { responseMail, verificationMail };
