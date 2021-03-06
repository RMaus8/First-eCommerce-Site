const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: [{type: String}],
    description: String,
    varnish: String,
    specs: String,
    clearance: {type: Boolean, default: false},
    clearancePrice: {type: Number, default: 0},
    timesPurchased: {type: Number, default: 0},
    productType: {type: String, required: true}
});

module.exports = mongoose.model("Product", productSchema);