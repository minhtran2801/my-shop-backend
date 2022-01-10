const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.orderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("user", "_id f_name l_name email")
    .exec((err, order) => {
      if (err || !order) {
        return res.status(400).json({ error: "Order does not exist" });
      }
      req.order = order;
      next();
    });
};

exports.createOrder = (req, res) => {
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((err, data) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }
    res.json(data);
  });
};

exports.listOrders = (req, res) => {
  Order.find()
    .populate("user", "_id f_name l_name email")
    .sort({ createdAt: -1 })
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) });
      }
      res.json(order);
    });
};

exports.readOrder = (req, res) => {
  res.json(req.order);
};

exports.getStatus = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateStatus = (req, res) => {
  Order.updateOne(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) });
      }
      res.json(order);
    }
  );
};
