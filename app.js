var express     = require("express"),
    app         = express(),
    session = require("express-session"),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    mailgun = require("mailgun"),
    methodOverride = require("method-override"),
    MongoStore = require("connect-mongo")(session),
    multer = require("multer"),
    path = require("path"),
    Product = require("./models/product"),
    User = require("./models/user"),
    seedDB = require("./seeds");
    
var productRoutes = require("./routes/products"),
    tableRoutes = require("./routes/products/tables"),
    soloRoutes = require("./routes/solos"),
    indexRoutes = require("./routes/index");
    
    // "mongodb://localhost/eriks_website"

mongoose.connect(process.env.DATABASEURL, {useMongoClient: true});
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
seedDB();

app.use(session({
    secret: "Zola and Milo are my special dogs",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: { maxAge: 180 * 60 * 1000 }
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());   
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.session = req.session;
    next();
});


app.use("/", indexRoutes);
app.use("/products/tables", tableRoutes);
app.use("/products", productRoutes);
app.use("/", soloRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started");
});