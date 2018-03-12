var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String,
    clearance: {type: Boolean, default: false},
    timesPurchased: {type: Number, default: 0},
    productType: {type: String, required: true}
});

module.exports = mongoose.model("Product", productSchema);