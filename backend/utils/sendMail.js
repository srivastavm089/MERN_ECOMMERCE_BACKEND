const nodeMailer = require("nodemailer");
const sendEmail = async ({ email, subject, message }) => {
  console.log(email, subject, message);
  try {
    const transporter = nodeMailer.createTransport({
      service:"gmail",
      auth: {
        user: "ms2364911@gmail.com",
        pass: "hyazjemvhirsaozw",
      },
    });

    console.log(email);

    const mailOptions = {
      from: "ms2364911@gmail.com",
      to: email,
      subject,
      text: message,
    };

   const result =  await transporter.sendMail(mailOptions);
   console.log(result)
  } catch (error) {
    console.log(error);
  }
};
module.exports = sendEmail;
