    const express = require("express");
    const app = express();

    const category = require("../models/index").Category;

    app.use(express.urlencoded({ extended: true }));

    //verify token
    const verifyToken = require("./verifyToken")
    app.use(verifyToken)

    app.get("/", async (req, res) => {
    category
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

    app.post("/", async (req, res) => {
    //tampung data request
    const data = {
        category_name: req.body.category_name,
    };

    category
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

    app.put("/", async (req, res) => {
    //tampung data request
    let data = {
        category_name: req.body.category_name,
    };

    let param = {
        category_id: req.body.category_id,
    };

    category
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

    app.delete("/:category_id", async (req, res) => {
    let category_id = req.params.category_id;
    let perameter = {
        category_id: category_id,
    };

    category
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
