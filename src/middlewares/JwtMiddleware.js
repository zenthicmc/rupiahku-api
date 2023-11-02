"use strict"

require('../config/database')
const jwt = require('jsonwebtoken');
const User = require('../models/User')
const { response401 } = require('../helpers/response')

async function JwtMiddleware (req, res, next) {
	try {
		const token = req.headers.authorization.split(' ')[1];
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

		// verification step 1
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		
		// verification step 2
		const user = await User.findOne({
			_id: decoded.sub,
		});
		if(!user) return response401(res);

		next();
		
	} catch (err) {
		return response401(res);
	}
}

module.exports = JwtMiddleware;