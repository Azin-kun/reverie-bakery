const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")
const md5 = require("md5")

// model user
const user = require("../models/index").User
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.post("/", async (req, res) => {
    let parameter = {
        email: req.body.email,
        password: md5(req.body.password)
    }

    let result = await user.findOne({where: parameter})
    if(result === null){
        res.json({
            logged: false,
            message: "Invalid email or Password"
        })
    }else{
        let jwtHeader = {
            algorithm: "HS256",
            expiresIn: "24h"
        }

        let payload = {data: result}
        let secretKey = "azinzin"

        let token = jwt.sign(payload, secretKey, jwtHeader)
        res.json({
            logged: true,
            data: result,
            token: token
        })
    }
}) 


module.exports = app