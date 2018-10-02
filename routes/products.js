var mongoose = require("mongoose"),
    express = require("express"),
    router = express.Router(),
    multer = require("multer"),
    middleware = require("../middleware"),
    path = require("path"),
    User = require("../models/user"),
    Cart = require("../models/cart"),
    csrf = require("csurf"),
    Product = require("../models/product"),
    utility = require("../shared/utility"),
    fs = require("fs");

//create the multer storage space
const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, callback){
        callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

//create the upload var to upload images
const upload = multer({
    storage: storage, //for the storage: use our storage var
    // limits: {fileSize: 1000000}, //limit picture size to 1 mb
    fileFilter: function(req, file, callback){
        checkFileType(file, callback) //call function and then define it below
    }
}).array("image", 3);

//function to check for filetypes
function checkFileType(file, callback){
    //allowed ext
    var filetypes = /jpeg|jpg|png|gif/;
    //check ext
    var extName = filetypes.test(path.extname(file.originalname).toLowerCase());
    //check mime
    var mimetype = filetypes.test(file.mimetype);
    //check that both are true
    if(mimetype && extName){
        return callback(null, true)
    } else {
        callback("Error: Images Only")
    }
}
    
//Index Route
router.get("/:prodType/", function(req, res){
    var successMsg = req.flash("success")[0];
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Product.find({name: regex, productType: req.params.prodType}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allProducts){
            if(err){
                console.log(err);
            } else {
                Product.count({name: regex}).exec(function (err, count){
                    if(err){
                        console.log(err);
                    } else {
                        if(allProducts.length < 1){
                            noMatch = "No products match that query, please try again.";
                        }
                        res.render("products/index", {
                            products: allProducts,
                            current: pageNumber,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: req.query.search,
                            successMsg: successMsg,
                            noMessage: !successMsg,
                            productType: req.params.prodType
                        });
                    };
                })
            }
        });
    } else {
        Product.find({productType: req.params.prodType}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allProducts){
            if(err){
                console.log(err)
            } else {
                Product.count({}).exec(function (err, count){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("products/index", {
                            products: allProducts,
                            current: pageNumber,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: false,
                            successMsg: successMsg,
                            noMessage: !successMsg,
                            productType: req.params.prodType
                        });
                    };
                });
            }
        });
    }
});

//New Route
router.get("/:prodType/new", middleware.isLoggedInAdmin, function(req, res) {
    res.render("products/new", {prodType: req.params.prodType});
});

//Create Route
router.post("/:prodType/", middleware.isLoggedInAdmin, function(req, res){
    upload(req, res, function(err){
        if (err) {
            console.log(err);
            return res.send("error uploading file");
        }
        const name = req.body.name;
        let image = []
        if(typeof req.files !== "undefined"){
            req.files.forEach(file => {
                image.push('/uploads/' + file.filename)
            })
        } else {
            // res.render("products/new")
            image = "uploads/no-image.png"
        }
        const price = req.body.price;
        const productType = req.params.prodType
        const desc = req.body.description;
        const specs = req.body.specs
        const varnish = req.body.varnish
        console.log(image)
        const newProduct = {name: name, image: image, price: price, description: desc, productType: productType, specs: specs, varnish: varnish};
        Product.create(newProduct, function(err, newlyCreatedProduct){
            if(err){
                console.log(err);
            } else {
                req.flash("success", "Product added!")
                res.redirect("/products/" + req.params.prodType);
            }
        });
    });
});

//show route
router.get("/:prodType/:id", function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
       if(err){
           console.log(err);
       } else {
            res.render("products/show", {product: foundProduct, image:foundProduct.image, prodType: req.params.prodType});
       }
    })
});

//show page varnish options route
router.get("/:prodType/:id/varnish", function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
       if(err){
           console.log(err);
       } else {
           res.render("products/showVarn", {product: foundProduct}); //render template and then pass in product (foundProduct)
       }
    });
});

//show page specs route
router.get("/:prodType/:id/specs", function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
       if(err){
           console.log(err);
       } else {
           res.render("products/showSpec", {product: foundProduct}); //render template and then pass in product (foundProduct)
       }
    });
});

//edit route
router.get("/:prodType/:id/edit", middleware.isLoggedInAdmin, function(req, res) {
    Product.findById(req.params.id, function(err, foundProduct){
        if(err){
            console.log(err);
        } else {
            res.render("products/edit", {product: foundProduct});
        }
    });
});

//update route
router.put("/:prodType/:id", middleware.isLoggedInAdmin, function(req, res){
    Product.findByIdAndUpdate(req.params.id, req.body.product, function(err, updatedProduct){
        if(err){
            console.log(err);
            res.redirect("/products/" + req.params.prodType);
        } else {
            res.redirect("/products/" + req.params.id + "/" + req.params.id);
        }
    });
});

//delete route
router.delete("/:prodType/:id", middleware.isLoggedInAdmin, function(req, res){
    Product.findByIdAndRemove(req.params.id, function(err, product){
        product.image.forEach(image => {
            fs.unlink('./public' + image, (error) => {
                if (error) {
                    console.log(error)
                } else {
                    console.log('delete image')
                }
            })
        })
        
        if(err){
            console.log(err);
        } else {
            res.redirect("/products/" + req.params.prodType);
        }
    });
});

router.get("/:prodType/add-to-cart/:id", function(req, res) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    
    Product.findById(productId, function (err, product){
        if(err){
            return res.redirect("/");
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect("/products/" + req.params.prodType)
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;