const sgMail = require("@sendgrid/mail");
const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

// your create order method with email capabilities
exports.createOrder = (req, res) => {
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((error, data) => {
    if (error) {
      return res.status(400).json({
        error: errorHandler(error),
      });
    }

    // send email alert to admin
    // order.address
    // order.products.length
    // order.amount
    const emailData = {
      to: "dendy.tran2801@gmail.com", // admin
      from: "minhd.tran2801@gmail.com",
      subject: `Order ${order._id} is placed`,
      html: `
          <h1>Hey Minh, somebody just made a purchase in your pharmacy store</h1>
          <h2>Customer name: ${order.user.f_name} ${order.user.l_name}</h2>
          <h2>Customer address: ${order.address_line_1}, ${order.city}, ${
        order.state
      }, ${order.postcode} </h2>
          <h2>User's purchase history: ${
            order.user.history.length
          } purchase</h2>
          <h2>User's email: ${order.user.email}</h2>
          <h2>Total products: ${order.products.length}</h2>
          <h2>Transaction ID: ${order.transaction_id}</h2>
          <h2>Order status: ${order.status}</h2>
          <h2>Product details:</h2>
          <hr />
          ${order.products
            .map((p) => {
              return `<div>
                      <h3>Product Name: ${p.name}</h3>
                      <h3>Product Price: ${p.price}</h3>
                      <h3>Product Quantity: ${p.purchase_quantity}</h3>
              </div>`;
            })
            .join("--------------------")}
          <h2>Total order cost: ${order.amount}<h2>
          <p>Login to your dashboard</a> to see the order in detail.</p>
      `,
    };
    sgMail
      .send(emailData)
      .then()
      .catch((err) => console.log("ERR >>>", err.body.errors));

    // email to buyer
    const emailData2 = {
      to: order.user.email,
      from: "minhd.tran2801@gmail.com",
      subject: `You order is in process`,
      html: `
          <h1>Hey ${req.profile.name}, Thank you for shopping with us.</h1>
          <h2>Total products: ${order.products.length}</h2>
          <h2>Transaction ID: ${order.transaction_id}</h2>
          <h2>Order status: ${order.status}</h2>
          <h2>Product details:</h2>
          <hr />
          ${order.products
            .map((p) => {
              return `<div>
                      <h3>Product Name: ${p.name}</h3>
                      <h3>Product Price: ${p.price}</h3>
                      <h3>Product Quantity: ${p.count}</h3>
              </div>`;
            })
            .join("--------------------")}
          <h2>Total order cost: ${order.amount}<h2>
          <p>Thank your for shopping with us.</p>
      `,
    };
    sgMail
      .send(emailData2)
      .then()
      .catch((err) => console.log("ERR 2 >>>", err));

    res.json(data);
  });
};
