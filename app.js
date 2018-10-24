const express = require("express"),
    app = express(),
    session = require("express-session"),
    csrf = require("csurf"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    MongoStore = require("connect-mongo")(session),
    User = require("./models/user"),
    seedDB = require("./seeds.js");
    // keys = require("./keys");
    
    
const productRoutes = require("./routes/products"),
    soloRoutes = require("./routes/solos"),
    indexRoutes = require("./routes/index");

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

const csrfProtection = csrf();
app.use(csrfProtection);

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
    res.locals.csrfToken = req.csrfToken();
    next();
});


app.use("/", indexRoutes);
app.use("/products", productRoutes);
app.use("/", soloRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started");
});