const express = require("express")
const app = express()
const cors = require("cors")
app.use(cors())

let auth = require("./router/auth")
let user = require("./router/user")
let category = require("./router/category")
let product = require("./router/product")
let order = require("./router/order")
let cart = require("./router/cart")

app.use("/reverie/login", auth)
app.use("/reverie/user", user)
app.use("/reverie/category", category)
app.use("/reverie/product", product)
app.use("/reverie/order", order)
app.use("/reverie/cart", cart)

app.use(express.static(__dirname))

app.listen(5000, ()=> {
    console.log(`server berjalan di port 5000`)
})