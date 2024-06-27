const express = require("express")
const md5 = require("md5")
const app = express()

const user = require("../models/index").User

app.use(express.urlencoded({extended:true}))

// verify token
const verifyToken = require("./verifyToken")
app.use(verifyToken)


app.get("/", async(req, res) => {
    user.findAll()
    .then(result => {
        res.json(result)
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

app.post("/", async(req, res) => {
    //tampung data request
    const data = {
        username: req.body.username,
        password: md5(req.body.password),
        email: req.body.email,
        phone_number: req.body.phone_number,
        address: req.body.address,
        user_type: req.body.user_type
    }

    user.create(data)
    .then(result => {
        res.json({
            message: "data telah di masukan",
            data: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})


app.put("/", async(req, res) => {
  //tampung data request
  let data = {
      username: req.body.username,
      password: md5(req.body.password),
      email: req.body.email,
      phone_number: req.body.phone_number,
      address: req.body.address,
      user_type: req.body.user_type
  }
      
  let param = {
      user_id: req.body.user_id
  }

  user.update(data,{where : param})
  .then(result => {
      res.json({
          message: "data telah di update",
          data: result
      })
  })
  .catch(error => {
      res.json({
          message: error.message
      })
  })
})

app.delete("/:user_id", async(req, res) => {
  let user_id = req.params.user_id
  let perameter = {
      user_id: user_id
  }

  user.destroy({where : perameter})
  .then(result => {
      res.json({
          message: "data telah di hapus",
          data: result
      })
  })
  .catch(error => {
      res.json({
          message: error.message
      })
  })
})

module.exports = app