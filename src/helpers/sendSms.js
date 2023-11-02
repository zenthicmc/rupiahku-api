// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = "AC423f9bb5a3ebe4f05e7865270790933d";
const authToken = "ee9f8aa648ebbe80a075de416ac81746";
const verifySid = "VA383fe6cf00b3e96017b7702136e178cf";
const client = require("twilio")(accountSid, authToken);

function sendSms() {
	client.messages
		.create({
			body: 'Hello from twilio-node',
			to: '+12345678901', // Text your number
			from: '+12345678901', // From a valid Twilio number
		})
		.then((message) => console.log(message.sid));
}

module.exports = sendSms;