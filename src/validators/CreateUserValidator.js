const { body } = require('express-validator');
const User = require('../models/User');

const CreateUserValidator = [
   body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),

	body("name").custom(async (value) => {
		const user = await User.findOne({ name: value });
		if (user) {
			throw new Error("Name already exists");
		}
		return true;
	}),

   body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

	body("email").custom(async (value) => {
		const user = await User.findOne({ email: value });
		if (user) {
			throw new Error("Email already exists");
		}
		return true;
	}),

   body("nohp")
      .notEmpty()
      .withMessage("No HP is required")
      .isLength({ min: 6 })
      .withMessage("No HP must be at least 6 characters long"),

	body("nohp").custom(async (value) => {
		const user = await User.findOne({ nohp: value });
		if (user) {
			throw new Error("No HP already exists");
		}
		return true;
	}),

   body("kelamin").notEmpty().withMessage("Kelamin is required"),

   body("kelamin").custom((value) => {
      const kelamin = ["Male", "Female"];
      if (!kelamin.includes(value)) {
         throw new Error("Kelamin must be Male or Female");
      }
      return true;
   }),

   body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
];

module.exports = CreateUserValidator;
