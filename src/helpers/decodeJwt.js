const jwt = require('jsonwebtoken');

const decodeJWT = (req) => {
	const token = req.headers.authorization.split(' ')[1];
	const decoded = jwt.verify(token, process.env.JWT_KEY);

	return decoded
}

module.exports = decodeJWT