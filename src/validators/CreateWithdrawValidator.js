const { body } = require('express-validator');

const CreateWithdrawValidator = [
	body('amount')
		.notEmpty()
		.withMessage('Amount is required'),
]

module.exports = CreateWithdrawValidator;
