var mongoose = require("mongoose"),
    express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    mailgun = require("mailgun.js"),
    middleware = require("../middleware"),
    User = require("../models/user"),
    Product = require("../models/product"),
    async = require("async"),
    nodemailer = require("nodemailer"),
    crypto = require("crypto");
    
var mailgun = require("mailgun-js");
var api_key = process.env.MAILGUN_API_KEY;
var DOMAIN = 'mg.bobbymdesigns.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

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
            // var mg = mailgun.client({
            //     username: 'api',
            //     key: process.env.MAILGUN_API_KEY || 'key-d10ff657dad15f5af086689c533cb4ed',
            //     public_key: process.env.MAILGUN_PUBLIC_KEY || ''
            // });
            var data = {
                to: user.email,
                from: 'Password Reset <passwordreset@bobbymdesigns.com>',
                subject: 'Account Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password associated with this email.' + '\n' +
                    'Please click on the following link, or copy and paste it into your browser to complete the reset process: ' +
                    'http://' + req.headers.host + '/reset/' + token + '\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged'
            };
            mailgun.messages().send(data, function (error, body) {
        //     function(err){
                req.flash("success", "An email has been sent to " + user.email + " with reset instructions");
                done(error, "done");
            });
        }
    ], function(err){
        if (err) return res.send(err);
        res.redirect("/forgot");
    });
});

//edit password
router.get("/reset/:token", function(req, res) {
    User.findOne({resetPasswordToken: req.params.token}, function(err, foundUser){
        if(err){
            req.flash("error", "User not found");
            res.redirect("/forgot");
        } else {
            res.render("reset", {user: foundUser});
        }
    });
});

//update password
router.post("/reset/:token", function(req, res){
    async.waterfall([
        function(done){
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, foundUser) {
                if(!foundUser){
                    req.flash("error", "Password reset link expired. Please request a new password reset link.");
                    res.redirect("/forgot");
                } 
                if(req.body.newPassword === req.body.confirmNewPassword){
                    foundUser.setPassword(req.body.newPassword, function(err){
                        foundUser.resetPasswordExpires = undefined;
                        foundUser.resetPasswordToken = undefined;
                        foundUser.save(function(err){
                            req.logIn(foundUser, function(err){
                                done(err, foundUser);
                            });
                        });
                    });
                } else {
                    req.flash("error", "Password fields do not match, please try again.");
                    res.redirect("back");
                }
            });
        },
        function(foundUser, done) {

            var data = {
                to: foundUser.email,
                from: 'Password Reset <passwordreset@bobbymdesigns.com>',
                subject: 'Account Password Has Been Reset',
                text: 'You are receiving this because you (or someone else) have just reset the password of the account associated with this email.' + '\n' +
                    'If you did not reset your password, please let us know immediately so we may resolve the issue.'
            };
            mailgun.messages().send(data, function (error, body) {
        //     function(err){
                req.flash("success", "Password has been reset!");
                done(error, "done");
            });
        }, function(err){
            res.redirect("/");
        }
    ]);
});


module.exports = router;