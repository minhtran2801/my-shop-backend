// CRUD Operations
exports.createCart = (req, res) => {
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
