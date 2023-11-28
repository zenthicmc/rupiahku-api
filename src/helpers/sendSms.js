const sendSms = async (number, code) => {
	const accountSid = "AC423f9bb5a3ebe4f05e7865270790933d";
  const authToken = "ee9f8aa648ebbe80a075de416ac81746";
  const client = require("twilio")(accountSid, authToken);

  await client.messages
    .create({
      body: "Silahkan verifikasi akun anda dengan memasukkan kode ini "+ code,
      from: "+14708655183",
      to: number
    })
  	.then((message) => console.log(message.sid))
  	.catch((err) => console.log(err))
}

module.exports = sendSms