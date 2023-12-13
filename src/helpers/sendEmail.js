const { createTransport } = require("nodemailer");
const emailTemplate = require("./emailTemplate");

const transporter = createTransport({
   host: "mail.himatikauty.com",
   port: 465,
   auth: {
      user: "rupiahku@himatikauty.com",
      pass: "@Himatikauty999",
   },
});

const sendEmail = async (name, email, code) => {
	const mailOptions = {
      from: "rupiahku@himatikauty.com",
      to: email,
      subject: `Verifikasi akun anda`,
      html: emailTemplate(name, email, code)
   };

	await transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent: " + info.response);
		}
	});
}

module.exports = sendEmail
