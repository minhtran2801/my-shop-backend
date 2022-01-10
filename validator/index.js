const User = require("../models/user");
const { check, body, validationResult } = require("express-validator");

exports.signupValidation = [
  check("f_name")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("First name is required")
    .bail(),

  check("l_name")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Last name is required")
    .bail(),

  check("email")
    .trim()
    .escape()
    .normalizeEmail()
    .not()
    .isEmpty()
    .withMessage("Your email cannot be empty")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .custom((email) => {
      return User.findOne({ email: email }).then((user) => {
        if (user)
          return Promise.reject(
            "This email has already been in use. Please try again"
          );
      });
    }),

  check("password")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Your password cannot be empty")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Your password must have 6 characters mininum")
    .bail()
    .matches("[0-9]")
    .withMessage("A number is required")
    .bail()
    .matches("[A-Z]")
    .withMessage("Password must contain an uppercase letter")
    .bail(),

  (req, res, next) => {
    const validationRes = validationResult(req);
    if (!validationRes.isEmpty()) {
      let errors = { errors: true };
      const fields_name = ["f_name", "l_name", "email", "password"];
      validationRes.array().map((err) => {
        errors[err.param] = err.msg;
      });

      fields_name.forEach((key) => {
        errors.hasOwnProperty(key)
          ? (errors[key] = errors[key])
          : (errors[key] = "");
      });
      return res.status(400).send(errors);
    }
    next();
  },
];

exports.productValidation = [
  body("name")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Product name is required")
    .bail(),

  body("description")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Product description is required")
    .bail(),

  body("price").trim().escape().not().isEmpty().withMessage("Required").bail(),

  body("quantity")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Required")
    .bail(),

  body("shipping")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Required")
    .bail(),

  body("ingredients")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Ingredients are required")
    .bail(),

  body("directions")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Directions are required")
    .bail(),

  body("category")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Category is required")
    .bail(),

  (req, res, next) => {
    const validationRes = validationResult(req);
    if (!validationRes.isEmpty()) {
      let errors = { errors: true };
      const fields_name = [
        "name",
        "description",
        "price",
        "quantity",
        "shipping",
        "ingredients",
        "directions",
        "category",
      ];
      validationRes.array().map((err) => {
        errors[err.param] = err.msg;
      });
      console.log(errors);

      fields_name.forEach((key) => {
        errors.hasOwnProperty(key)
          ? (errors[key] = errors[key])
          : (errors[key] = "");
      });
      return res.status(400).send(errors);
    }
    next();
  },
];

exports.passwordValidation = [
  check("password")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Your password cannot be empty")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Your password must have 6 characters mininum")
    .bail()
    .matches("[0-9]")
    .withMessage("A number is required")
    .bail()
    .matches("[A-Z]")
    .withMessage("Password must contain an uppercase letter")
    .bail(),

  check("confirm_password")
    .trim()
    .escape()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(
          "Password confirmation does not match password. Please try again!"
        );
      }

      // Indicates the success of this synchronous custom validator
      return true;
    })
    .bail(),

  (req, res, next) => {
    const validationRes = validationResult(req);
    if (!validationRes.isEmpty()) {
      let errors = { error: validationRes.errors[0].msg };
      console.log(validationRes.errors[0].msg);
      return res.status(400).send(errors);
    }
    next();
  },
];
