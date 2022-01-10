const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: ObjectId, ref: "Product" },
    name: String,
    price: Number,
    purchase_quantity: Number,
  },
  { timestamps: true }
);

const CartItem = mongoose.model("CartItem", CartItemSchema);

const OrderSchema = new mongoose.Schema(
  {
    products: [CartItemSchema],
    transaction_id: {},
    amount: { type: Number },
    address_line_1: String,
    address_line_2: String,
    city: String,
    state: String,
    postcode: Number,
    billing_address_line_1: String,
    billing_address_line_2: String,
    billing_city: String,
    billing_state: String,
    billing_postcode: Number,
    status: {
      type: String,
      default: "Not processed",
      enum: [
        "Not processed",
        "Processing",
        "Dispatched",
        "Delivered",
        "Cancelled",
      ], // enum means string objects
    },
    updated: Date,
    user: { type: ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = { Order, CartItem };
