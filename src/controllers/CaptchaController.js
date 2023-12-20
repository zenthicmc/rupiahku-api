"use strict";

const axios = require('axios')
const { v4: uuidv4 } = require("uuid");

async function verify(req, res) {
   try {
		const token = req.body.token;
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

		const result = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			'secret': process.env.CAPTCHA_KEY,
			'response': token,
			'remoteip': ip,
		})

		if(result.data.success) {
			return res.json({
				success: true,
				message: 'Captcha valid'
			})
		}

		return res.json({
			success: false,
			message: 'Captcha invalid'
		})
	} catch (error) {
		return res.json({
			success: false,
			message: 'Captcha invalid'
		})
	}
}

module.exports = {
	verify
}