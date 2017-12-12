var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Product = require("./models/product"),
    seedDB = require("./seeds");
    
// var productRoutes = require("./routes/products")
    
mongoose.connect("mongodb://localhost/eriks_website", {useMongoClient: true});
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
seedDB();

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/products", function(req, res){
    Product.find({}, function(err, allProducts){
        if(err){
            console.log(err);
        } else {
            res.render("products/index", {products: allProducts});
        }
    });
});

app.get("/products/new", function(req, res) {
    res.render("products/new");
});

app.post("/products", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var desc = req.body.description;
    var newProduct = {name: name, image: image, price: price, description: desc};
    Product.create(newProduct, function(err, newlyCreatedProduct){
        if(err){
            console.log(err);
        } else {
            res.redirect("/products");
        }
    })
})

// app.use("/products", productRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started");
});