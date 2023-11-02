const { body } = require('express-validator');

const CreateDepositValidator = [
	body('amount')
		.notEmpty()
		.withMessage('Amount is required'),

	body('method')
		.notEmpty()
		.withMessage('Method is required'),

]

module.exports = CreateDepositValidator;
