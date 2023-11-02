const decodeJwt = require('../helpers/decodeJwt')

const CheckOwner = (req, id) => {
	const decoded = decodeJwt(req)
	if(decoded.sub !== id) return false
	return true
}

module.exports = CheckOwner