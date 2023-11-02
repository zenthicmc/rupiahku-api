"use strict"

require('../config/database')
const { response403, response404, response500 } = require('../helpers/response')
const decodeJwt = require('../helpers/decodeJwt')
const notification = require('../models/Notification')

async function show(req, res) {
	try {
		const token = decodeJwt(req)
		const notifications = await notification
			.find({ receiver_id: token.sub })
			.sort({createdAt: -1})

		return res.json({
			success: true,
			code: 200,
			message: "Your notifications fetched successfully",
			data: notifications
		})

	} catch (err) {
		return response500(res)
	}
}

module.exports = {
	show,
}