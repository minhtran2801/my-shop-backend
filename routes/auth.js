const express = require("express");
const router = express.Router();
const { signup, signin, signout } = require("../controllers/auth");
const { signupValidation } = require("../validator");

router.route("/signup").post(signupValidation, signup);
router.route("/signin").post(signin);
router.route("/signout").get(signout);

module.exports = router;
