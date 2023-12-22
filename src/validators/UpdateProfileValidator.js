const { body } = require("express-validator");
const User = require("../models/User");

const UpdateProfileValidator = [
   body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),

   body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

   body("nohp")
      .notEmpty()
      .withMessage("No HP is required")
      .isLength({ min: 6 })
      .withMessage("No HP must be at least 6 characters long"),
];

module.exports = UpdateProfileValidator;
