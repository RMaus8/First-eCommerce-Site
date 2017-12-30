var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var orderSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    cart: {type: Object, required: true},
    address: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zip: {type: String, required: true},
    name: {type: String, required: true},
    paymentId: {type: String, required: true},
    
});

module.exports = mongoose.model("Order", orderSchema);