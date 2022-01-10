const express = require("express");
const router = express.Router();
const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");
const {
  userById,
  readUser,
  updateUser,
  orderHistory,
} = require("../controllers/user");
const { passwordValidation } = require("../validator");

router.get("/secret/:userId", requireSignIn, isAuth, isAdmin, (req, res) => {
  res.json({ user: req.profile });
});

router.get("/user/:userId", requireSignIn, isAuth, readUser);
router.put("/user/update/:userId", requireSignIn, isAuth, updateUser);
router.put(
  "/user/update/password/:userId",
  passwordValidation,
  requireSignIn,
  isAuth,
  updateUser
);

router.get("/order/history/:userId", requireSignIn, isAuth, orderHistory);

router.param("userId", userById);

module.exports = router;
