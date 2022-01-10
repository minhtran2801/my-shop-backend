const express = require("express");
const router = express.Router();
const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");
const { userById, addOrderToHistory } = require("../controllers/user");
const {
  createOrder,
  listOrders,
  readOrder,
  orderById,
  getStatus,
  updateStatus,
} = require("../controllers/order");
const { decreaseQuantity } = require("../controllers/product");

router.post(
  "/order/create/:userId",
  requireSignIn,
  isAuth,
  addOrderToHistory,
  decreaseQuantity,
  createOrder
);

router.get("/order/list/:userId", requireSignIn, isAuth, isAdmin, listOrders);
router.get("/order/status/:userId", requireSignIn, isAuth, isAdmin, getStatus);
router.get("/order/:userId/:orderId", requireSignIn, isAuth, readOrder);

router.put(
  "/order/:userId/status/:orderId",
  requireSignIn,
  isAuth,
  isAdmin,
  updateStatus
);

router.param("userId", userById);
router.param("orderId", orderById);

module.exports = router;
