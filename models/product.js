var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String
});

module.exports = mongoose.model("Product", productSchema);