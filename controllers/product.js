const Product = require("../models/product");
const fs = require("fs");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");

// MIDDLEWARES
exports.productById = (req, res, next, id) => {
  Product.findById(id).exec((err, product) => {
    if (err || !product) {
      return res.status(400).json({ error: "Product does not exist" });
    }
    req.product = product;
    next();
  });
};

exports.sendProductPhoto = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

// CRUD Operations
exports.createProduct = (req, res) => {
  const fields = req.body;
  const photoFile = req.file;
  // Check requirements for all fields
  const {
    name,
    description,
    ingredients,
    directions,
    price,
    category,
    quantity,
    shipping,
  } = fields;
  if (
    !name ||
    !description ||
    !ingredients ||
    !directions ||
    !price ||
    !category ||
    !quantity ||
    !shipping
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }
  let product = new Product(fields);
  // Split ingredients to store in an array
  if (fields.ingredients) {
    product.ingredients = fields.ingredients.split("\n");
  }
  // Check if there is a photo and its type
  if (photoFile) {
    if (photoFile.size > 1000000) {
      return res
        .status(400)
        .json({ error: "Image should be less than 1mb in size" });
    }
    product.photo.data = fs.readFileSync(photoFile.path);
    product.photo.contentType = photoFile.mimetype;
  }
  // Save product to db
  product.save((err, result) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }
    res.json(result);
  });
  // });
};

// NOt sending photo with product to send product to front end faster
// Photo will be handled by another middleware
exports.readProduct = (req, res) => {
  req.product.photo = undefined;
  res.json(req.product);
};

exports.updateProduct = (req, res) => {
  const fields = req.body;
  const photoFile = req.file;
  // // Check requirements for all fields
  // const {
  //   name,
  //   description,
  //   ingredients,
  //   directions,
  //   price,
  //   category,
  //   quantity,
  //   shipping,
  // } = fields;
  // if (
  //   !name ||
  //   !description ||
  //   !ingredients ||
  //   !directions ||
  //   !price ||
  //   !category ||
  //   !quantity ||
  //   !shipping
  // ) {
  //   return res.status(400).json({ error: "All fields are required" });
  // }

  // Split ingredients to store in an array
  if (fields.ingredients) {
    fields.ingredients = fields.ingredients.split(",");
  }

  let product = req.product;
  product = _.extend(product, fields);

  // Check if there is a photo and its type
  if (photoFile) {
    if (photoFile.size > 1000000) {
      return res
        .status(400)
        .json({ error: "Image should be less than 1mb in size" });
    }
    product.photo.data = fs.readFileSync(photoFile.path);
    product.photo.contentType = photoFile.mimetype;
  }

  // Save product to db
  product.save((err, result) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }
    res.json(result);
  });
};

exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }
    res.json({ message: `${deletedProduct.name} deleted successfully.` });
  });
};

/**
 * Most popular/ new arrival product
 * most popular = /products?sortBy=soldprods&order=desc&limit=4
 * new arrival = /products?sortBy=createdat&order=desc&limit=4
 * no params = return all products
 */
exports.listProducts = (req, res) => {
  let order = req.query.order ? req.query.order : "desc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "soldprods";
  let limit = req.query.limit ? parseInt(req.query.limit) : 100;

  // Select all product details EXCEPT for photos to increase performance
  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({ error: "Products not found" });
      }
      res.json(products);
    });
};

exports.searchProducts = (req, res) => {
  Product.find({ name: { $regex: req.query.q, $options: "i" } })
    .select("-photo")
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({ error: "Products not found" });
      }
      res.json(products);
    });
};

exports.listRelatedProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 4;
  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .populate("category", "_id name")
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({ error: "Products not found" });
      }

      res.json(products);
    });
};

exports.listCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({ error: "Products not found" });
    }
    res.json(categories);
  });
};

/**
 * Apply filters to search for products
 * Allow users to filter by categories (using checkbox) and price range using slider
 * User click "apply" to search for products
 * skip for load more button
 * @param {categories, priceRange} req
 * @param { products} res
 */
exports.filterProducts = (req, res) => {
  let order = "desc";
  let sortBy = "soldprods";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  let filtersArgs = {};

  if (req.body.sort) {
    order = req.body.sort.order;
    sortBy = req.body.sort.sortBy;
  }

  // Check for applied filters
  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        filtersArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        filtersArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(filtersArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .skip(skip)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({ error: "Products not found" });
      }
      res.json({
        size: products.length,
        products,
      });
    });
};

exports.decreaseQuantity = (req, res, next) => {
  let decrease = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: {
          $inc: {
            quantity: -prod.purchase_quantity,
            soldItems: +prod.purchase_quantity,
          },
        },
      },
    };
  });

  Product.bulkWrite(decrease, {}, (err, product) => {
    if (err) {
      return res.status(400).json({ error: "Could not update quantity" });
    }
    next();
  });
};
