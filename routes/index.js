var mongoose = require("mongoose"),
    express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    mailgun = require("mailgun.js"),
    middleware = require("../middleware"),
    User = require("../models/user"),
    Product = require("../models/product"),
    Cart = require("../models/cart"),
    async = require("async"),
    nodemailer = require("nodemailer"),
    Order = require("../models/order"),
    csrf = require("csurf"),
    crypto = require("crypto");

var mailgun = require("mailgun-js");
var api_key = process.env.MAILGUN_API_KEY;
//MAILGUN_API_KEY=key-d10ff657dad15f5af086689c533cb4ed
var DOMAIN = 'mg.bobbymdesigns.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

router.get("/", function(req, res){
    res.render("landing");
});

router.get("/login", function(req, res) {
    res.render("user/login", {csrfToken: req.csrfToken()});
});

router.post("/login", middleware.usernameToLowerCase, passport.authenticate("local",
    {
        successRedirect: "/products",
        failureRedirect: "/login"
    }), function(req, res){
});

router.get("/register", function(req, res) {
    res.render("user/register");
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
                return res.render("user/register");
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
    res.render("user/forgot");
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
            res.render("user/reset", {user: foundUser});
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

router.get("/shopping-cart", function(req, res) {
    if(!req.session.cart){
        return res.render("products/shopping-cart", {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render("products/shopping-cart", {products: cart.generateArray(), totalPrice: cart.totalPrice, checkoutPrice: cart.totalPrice * 100, totalQty: cart.totalQty});
});


router.post("/shopping-cart", middleware.isLoggedIn, function(req, res) {
    if(!req.session.cart) {
        return res.render("product/shopping-cart");
    } 

    var cart = new Cart(req.session.cart);
    var stripe = require("stripe")(
      "sk_test_451bUetAuy87LnVAJx4oKyQy"
    );
    
    var order = {
          user: req.user,
          cart: req.session.cart,
          address: req.body.stripeShippingAddressLine1,
          city: req.body.stripeShippingAddressCity,
          state: req.body.stripeShippingAddressState,
          zip: req.body.stripeShippingAddressZip,
          name: req.body.stripeShippingName
    };
    Order.create(order, function(err, newOrder){
        if(err){
            console.log(err);
        } else {
            console.log(newOrder);
        }
    })
    
    stripe.customers.create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken
    }, function(err, customer) {
      // asynchronously called
      stripe.charges.create({
          amount: cart.totalPrice * 100,
          currency: "usd",
          customer: customer.id,
          description: "Test Charge"
        }, function(err, charge) {
          if(err){
              req.flash("error", err.message);
              return res.redirect("/shopping-cart");
          } else {
              order.paymentId = charge.id;
              req.flash("success", "purchase successful");
              req.session.cart = null;
              res.redirect("/products");
          }
        });
    });
    
});

router.get("/profile", middleware.isLoggedIn, function(req, res){
    Order.find({user: req.user}, function(err, orders){
        if(err){
            return req.flash("error", err);
        }
        var cart;
        orders.forEach(function(order){
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', {orders: orders});
    });
});

module.exports = router;