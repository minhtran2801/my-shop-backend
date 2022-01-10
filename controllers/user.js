const User = require("../models/user");
const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: "User not found" });
    }
    req.profile = user;
    next();
  });
};

exports.readUser = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  User.findOne({ _id: req.profile._id }, (err, foundUser) => {
    if (err) {
      return res
        .status(400)
        .json({ error: "You are not authorized to update this profile" });
    }
    if (req.body.f_name) {
      foundUser.f_name = req.body.f_name;
    }
    if (req.body.l_name) {
      foundUser.l_name = req.body.l_name;
    }
    if (req.body.email) {
      foundUser.email = req.body.email;
    }
    if (req.body.password) {
      foundUser.password = req.body.password;
    }
    foundUser.save((err, updatedUser) => {
      if (err) {
        console.log("USER UPDATE ERROR", err);
        return res.status(400).json({
          error: "User update failed",
        });
      }
      updatedUser.hashed_password = undefined;
      updatedUser.salt = undefined;
      return res.json(updatedUser);
    });
  });
};

exports.addOrderToHistory = (req, res, next) => {
  let history = [];
  req.body.order.products.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.purchase_quantity,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount,
    });
  });

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (err, data) => {
      if (err) {
        return res.status(400).json({ error: "Cannot update user history" });
      }
      next();
    }
  );
};

exports.orderHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .sort({ createdAt: -1 })
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) });
      }
      res.json(orders);
    });
};
