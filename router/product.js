const express = require("express");
const md5 = require("md5");
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
  let perameter = {
    product_id: product_id,
  };

  product
    .destroy({ where: perameter })
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

module.exports = app;
