const axios = require('axios')
const { response400, response403, response404, response500 } = require('../helpers/response')

const getPayments = async (req, res) => {
	try {
		const payments = await axios.get('https://tripay.co.id/api-sandbox/merchant/payment-channel', {
			headers: {
				'Authorization': 'Bearer ' + process.env.TRIPAY_API_KEY,
				"Accept-Encoding": "gzip,deflate,compress",
			}
		})

		return res.json({
			success: true,
			code: 200,
			message: "Payments fetched successfully",
			data: payments.data.data,
		})

	} catch (err) {
		console.log(err)
	}
}

module.exports = {
	getPayments
}
