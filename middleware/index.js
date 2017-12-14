var middlewareObj = {},
    Product = require("../models/product"),
    mongoose = require("mongoose");
    
middlewareObj.checkAdminProduct = function(req, res, next){
    if(req.isAuthenticated()){
        Product.findById(req.params.id, function(err, foundProduct){
            if(err){
                req.flash("error", "Product not found!");
                res.redirect("back");
            } else {
                if(req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}
    
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!")
    res.redirect("/login");
}

middlewareObj.isLoggedInAdmin = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            return next();
        } else {
            req.flash("error", "You don't have permission to do that!")
        }
    }
    req.flash("error", "You need to be logged in as an admin to do that!")
    res.redirect("/login");
}

module.exports = middlewareObj;