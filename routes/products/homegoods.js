var mongoose = require("mongoose"),
    express = require("express"),
    router = express.Router(),
    multer = require("multer"),
    middleware = require("../../middleware"),
    path = require("path"),
    User = require("../../models/user"),
    Cart = require("../../models/cart"),
    Product = require("../../models/product");
    
// create the multer storage space
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
}).single("image");

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

//homegoods index route 
router.get("/", function(req, res){
    var successMsg = req.flash("success")[0];
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Product.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allhomegoods){
            if(err){
                console.log(err);
            } else {
                Product.count({name: regex}).exec(function (err, count){
                    if(err){
                        console.log(err);
                    } else {
                        if(allhomegoods.length < 1){
                            noMatch = "No products match that query, please try again.";
                        }
                        res.render("products/homegoods/index", {
                            products: allhomegoods,
                            current: pageNumber,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: req.query.search,
                            successMsg: successMsg,
                            noMessage: !successMsg
                        });
                    };
                })
            }
        });
    } else {
        Product.find({productType: "homegoods"}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allhomegoods){
            if(err){
                console.log(err)
            } else {
                Product.count({productType: "homegoods"}).exec(function (err, count){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("products/homegoods/index", {
                            products: allhomegoods,
                            current: pageNumber,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: false,
                            successMsg: successMsg,
                            noMessage: !successMsg
                            
                        });
                    };
                });
            }
        });
    }
});

//homegoods new route 
router.get("/new", middleware.isLoggedInAdmin, function(req, res) {
    res.render("products/homegoods/new");
});

//homegoods create route 
router.post("/", middleware.isLoggedInAdmin, function(req, res){
    upload(req, res, function(err){
        if(err){
        console.log(err);
        return res.send("error uploading file");
        }
        var name = req.body.name;
        if(typeof req.file !== "undefined"){
            var image = "/uploads/" + req.file.filename;
        } else {
            // res.render("products/new")
            var image = "uploads/no-image.png"
        }
        var price = req.body.price;
        var desc = req.body.description;
        var newProduct = {name: name, image: image, price: price, description: desc, productType: "homegoods"};
        Product.create(newProduct, function(err, newlyCreatedProduct){
            if(err){
                console.log(err);
            } else {
                req.flash("success", "Product added!")
                res.redirect("/products/homegoods");
            }
        });
    });
});

//homegoods show route 
router.get("/:id", function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
      if(err){
          console.log(err);
      } else {
          res.render("products/homegoods/show", {product: foundProduct}); //render template and then pass in product (foundProduct)
      }
    });
});

//show page varnish options route
router.get("/:id/varnish", function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
      if(err){
          console.log(err);
      } else {
          res.render("products/homegoods/showVarn", {product: foundProduct}); //render template and then pass in product (foundProduct)
      }
    });
});

//show page specs route
router.get("/:id/specs", function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
      if(err){
          console.log(err);
      } else {
          res.render("products/homegoods/showSpec", {product: foundProduct}); //render template and then pass in product (foundProduct)
      }
    });
});

//edit route
router.get("/:id/edit", middleware.isLoggedInAdmin, function(req, res) {
    Product.findById(req.params.id, function(err, foundProduct){
        if(err){
            console.log(err);
        } else {
            res.render("products/homegoods/edit", {product: foundProduct});
        }
    });
});

//update route
router.put("/:id", middleware.isLoggedInAdmin, function(req, res){
    Product.findByIdAndUpdate(req.params.id, req.body.product, function(err, updatedProduct){
        if(err){
            console.log(err);
            res.redirect("/products/homegoods/");
        } else {
            res.redirect("/products/homegoods/" + req.params.id);
        }
    });
});

//delete route
router.delete("/:id", middleware.isLoggedInAdmin, function(req, res){
    Product.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect("/products/homegoods/");
        }
    });
});

router.get("/add-to-cart/:id", function(req, res) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    
    Product.findById(productId, function (err, product){
        if(err){
            return res.redirect("/");
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect("/products/homegoods")
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;