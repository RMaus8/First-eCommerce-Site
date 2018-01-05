var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String,
    productType: {type: String, required: true}
});

module.exports = mongoose.model("Product", productSchema);