const { body } = require('express-validator');

const CreateTransferValidator = [
	body('receiver').notEmpty().withMessage('Receiver Phone is required'),

	body('amount')
		.notEmpty()
		.withMessage('Amount is required'),

]

module.exports = CreateTransferValidator;
