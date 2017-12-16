var mongoose = require("mongoose"),
    express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    middleware = require("../middleware"),
    User = require("../models/user"),
    Product = require("../models/product"),
    async = require("async"),
    nodemailer = require("nodemailer"),
    crypto = require("crypto");
    

router.get("/", function(req, res){
    res.render("landing");
});



router.get("/login", function(req, res) {
    res.render("login");
});

router.post("/login", middleware.usernameToLowerCase, passport.authenticate("local",
    {
        successRedirect: "/products",
        failureRedirect: "/login"
    }), function(req, res){
});

router.get("/register", function(req, res) {
    res.render("register");
});

router.post("/register", middleware.usernameToLowerCase, function(req, res){
    var newUser = new User({username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email});
    if(req.body.adminCode === "secretcode123") {
        newUser.isAdmin = true;
    }
    if(req.body.password === req.body.confirmPassword) {
        User.register(newUser, req.body.password, function(err, user){
            if(err){
                console.log(err);
                return res.render("register");
            }
            passport.authenticate("local")(req, res, function(){
                res.redirect("/products");
            });
        });
    } else {
        req.flash("error", "Passwords do not match!");
        res.redirect("/register");
    }
    
});

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/products");
});

router.get("/forgot", function(req, res){
    res.render("forgot");
});

router.post("/forgot", function(req, res) {
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done){
            User.findOne({ email: req.body.email }, function(err, user) {
                if(!user) {
                    req.flash("error", "No account with that email address exists.");
                    return res.redirect("/forgot");
                }
                
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000 //1 hour
                
                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: 'rmausolf06@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'rmausolf06@gmail.com',
                subject: 'Account Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password associated with this email' +
                    'Please click on the following link, or copy and paste it into your browser to complete the reset process' +
                    'http://' + req.headers.host + '/reset/' + token + '/n/n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                console.log("mail sent");
                req.flash("success", "An email has been sent to " + user.email + " with reset instructions");
                done(err, "done");
            });
        }
    ], function(err){
        if (err) return res.send(err);
        res.redirect("/forgot");
    });
});

module.exports = router;