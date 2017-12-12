// var mongoose = require("mongoose"),
//     express = require("express"),
//     app = express(),
//     router = express.Router(),
//     middleware = require("../middleware"),
//     Product = require("../models/product");
    
// //Index Route
// app.get("/products", function(req, res){
//     Product.find({}, function(err, allProducts){
//         if(err){
//             console.log(err);
//         } else {
//             res.render("products/index", {products: allProducts});
//         }
//     });
// });