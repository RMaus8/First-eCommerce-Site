var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String
});

module.exports = mongoose.model("Product", productSchema);