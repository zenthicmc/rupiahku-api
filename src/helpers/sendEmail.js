const { createTransport } = require("nodemailer");
const emailTemplate = require("./emailTemplate");

const transporter = createTransport({
   host: "mail.himatikauty.or.id",
   port: 465,
   auth: {
      user: "rupiahku@himatikauty.or.id",
      pass: "^5f2GW_!lRuB",
   },
});

const sendEmail = async (name, email, code) => {
	const mailOptions = {
      from: "rupiahku@himatikauty.or.id",
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
