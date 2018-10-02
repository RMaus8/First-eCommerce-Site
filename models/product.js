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

// productSchema.statics.findProduct = function (id, req, res) {
//     return this.model('Product').findById(id, (error, foundProduct) => {
//         if (error) {
//             console.log(error)
//             req.flash('error', 'there was a problem')
//             res.redirect('back')
//         } else {
//             return this.foundProduct;
//         }
//     });
// }

// productSchema.statics.handleError = function (error, req, res) {
//         if(error){
//             console.log(error)
//             req.flash('error', 'there was a problem')
//             res.redirect('back')
//         }
// }

// productSchema.methods.createImageArr = function (error) {
//     if (error) {
//         console.log(error)
//     } else {
//         let image = [];
//         image.push(this.image1);
//         image.push(this.image2);
//         image.push(this.image3);
//         return image;
//     }
// }

module.exports = mongoose.model("Product", productSchema);