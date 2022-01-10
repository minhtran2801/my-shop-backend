const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.categoryById = (req, res, next, id) => {
  Category.findById(id).exec((err, category) => {
    if (err || !category) {
      return res.status(400).json({ error: "Category does not exist" });
    }
    req.category = category;
    next();
  });
};

exports.createCategory = (req, res) => {
  const category = new Category(req.body);
  category.save((err, data) => {
    if (err) {
      return res.status(400).json({ error: "Category has to be unique" });
    }
    res.json({
      data,
    });
  });
};

exports.readCategory = (req, res) => {
  return res.json(req.category);
};

exports.updateCategory = (req, res) => {
  const category = req.category;
  category.name = req.body.name;

  category.save((err, data) => {
    if (err) {
      res.status(400).json({ error: errorHandler(err) });
    }
    res.json({
      data,
    });
  });
};

exports.deleteCategory = (req, res) => {
  let category = req.category;
  category.remove((err, deletedCategory) => {
    if (err) {
      res.status(400).json({ error: errorHandler(err) });
    }
    res.json({
      message: `${deletedCategory.name} has been successfully deleted.`,
    });
  });
};

exports.listCategory = (req, res) => {
  Category.find().exec((err, data) => {
    if (err) {
      res.status(400).json({ error: errorHandler(err) });
    }
    res.json({
      data,
    });
  });
};
