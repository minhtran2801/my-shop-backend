const express = require("express");
const router = express.Router();
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
var upload = multer({ storage: storage });

const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { productValidation } = require("../validator");
const {
  createProduct,
  readProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  searchProducts,
  listRelatedProducts,
  listCategories,
  filterProducts,
  sendProductPhoto,
  productById,
} = require("../controllers/product");
const { validationResult } = require("express-validator");

router.post(
  "/product/create/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  upload.single("photo"),
  productValidation,
  createProduct
);

router.get("/product/:productId", readProduct);

router.delete(
  "/product/:productId/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  deleteProduct
);

router.put(
  "/product/:productId/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  upload.single("photo"),
  updateProduct
);

router.get("/products", listProducts);
router.get("/products/search", searchProducts);
router.get("/products/related/:productId", listRelatedProducts);
router.get("/products/categories", listCategories);
router.post("/products/by/filter", filterProducts);
router.get("/products/photo/:productId", sendProductPhoto);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
