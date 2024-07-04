const express = require("express");
const { Op } = require("sequelize");
const app = express();

const multer = require("multer"); //multer digunakan untuk membaca data request dari form-data
const path = require("path"); //path untuk menage alamat direktori file
const fs = require("fs"); // fs atau file stream digunakan untuk manage file

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./image");
  },
  filename: (req, file, cb) => {
    cb(null, "image-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const product = require("../models/index").Product;

app.use(express.urlencoded({ extended: true }));

// verify token
const verifyToken = require("./verifyToken");
app.use(verifyToken);

app.get("/", async (req, res) => {
  product
    .findAll()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.json({
        message: error.message,
      });
    });
});

app.post("/", upload.single("image"), async (req, res) => {
  //tampung data request
  const data = {
    name: req.body.name,
    image: req.file.filename,
    rating: req.body.rating,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
    category_id: req.body.category_id,
  };

  product
    .create(data)
    .then((result) => {
      res.json({
        message: "data telah di masukan",
        data: result,
      });
    })
    .catch((error) => {
      res.json({
        message: error.message,
      });
    });
});

app.put("/", upload.single("image"), async (req, res) => {
  // tampung data request
  let data = {
    name: req.body.name,
    rating: req.body.rating,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
    category_id: req.body.category_id,
  };

  let param = {
    product_id: req.body.product_id,
  };

  if (req.file) {
    let oldProduct = await product.findOne({ where: param });
    let oldImage = oldProduct.image;

    // delete file lama
    let pathfile = path.join(__dirname, "../image", oldImage);
    fs.unlink(pathfile, (error) => console.log(error));

    data.image = req.file.filename;
  }

  product
    .update(data, { where: param })
    .then((result) => {
      res.json({
        message: "data telah di update",
        data: result,
      });
    })
    .catch((error) => {
      res.json({
        message: error.message,
      });
    });
});

app.delete("/:product_id", async (req, res) => {
  let product_id = req.params.product_id;
  let parameter = {
    product_id: product_id,
  };

  product
    .destroy({ where: parameter })
    .then((result) => {
      res.json({
        message: "data telah di hapus",
        data: result,
      });
    })
    .catch((error) => {
      res.json({
        message: error.message,
      });
    });
});

app.get("/search", async (req, res) => {
  const query = req.query.q;
  try {
    const results = await product.findAll({
      where: {
        name: {
          [Op.like]: `%${query}%`,
        },
      },
      attributes: ['name', 'description', 'image', 'price', 'rating']
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Endpoint baru untuk mencari produk berdasarkan ID
app.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await product.findByPk(id);
    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = app;
