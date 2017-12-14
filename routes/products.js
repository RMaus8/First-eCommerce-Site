var mongoose = require("mongoose"),
    express = require("express"),
    router = express.Router(),
    multer = require("multer"),
    middleware = require("../middleware"),
    path = require("path"),
    User = require("../models/user"),
    Product = require("../models/product");

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
    
//Index Route
router.get("/", function(req, res){
    Product.find({}, function(err, allProducts){;
        if(err){
            console.log(err);
        } else {
            res.render("products/index", {products: allProducts});
        }
    });
});

//New Route
router.get("/new", middleware.isLoggedInAdmin, function(req, res) {
    res.render("products/new");
});

//Create Route
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
        var newProduct = {name: name, image: image, price: price, description: desc};
        Product.create(newProduct, function(err, newlyCreatedProduct){
            if(err){
                console.log(err);
            } else {
                req.flash("success", "Product added!")
                res.redirect("/products");
            }
        });
    });
});

//show route
router.get("/:id", function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
       if(err){
           console.log(err);
       } else {
           res.render("products/show", {product: foundProduct}); //render template and then pass in product (foundProduct)
       }
    });
});


module.exports = router;