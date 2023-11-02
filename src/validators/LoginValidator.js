const { body } = require('express-validator');

const LoginValidator = [
	body('nohp')
		.notEmpty()
		.withMessage('No HP is required'),
		
	body('password')
		.notEmpty()
		.withMessage('Password is required')
]

module.exports = LoginValidator;
