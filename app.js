var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override");
    
mongoose.connect(process.env.DATABASE, {useMongoClient: true});
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started");
});