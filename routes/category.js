const express = require("express");
const router = express.Router();
const {
  createCategory,
  categoryById,
  readCategory,
  updateCategory,
  deleteCategory,
  listCategory,
} = require("../controllers/category");
const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.post(
  "/category/create/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  createCategory
);

router.get("/category/:categoryId", readCategory);

router.put(
  "/category/:categoryId/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  updateCategory
);

router.delete(
  "/category/:categoryId/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  deleteCategory
);

router.get("/categories", listCategory);

router.param("userId", userById);
router.param("categoryId", categoryById);

module.exports = router;
