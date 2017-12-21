var mongoose = require("mongoose"),
    express = require("express"),
    router = express.Router(),
    mailgun = require("mailgun-js"),
    middlesware = require("../middleware");

var api_key = process.env.MAILGUN_API_KEY;
var DOMAIN = 'mg.bobbymdesigns.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});


router.get("/about", function(req, res) {
    res.render("about/index");
});

router.get("/contact", function(req, res) {
    res.render("contact");
});

router.post("/contact", function(req, res){
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var phone = req.body.phone;
    var reason = req.body.contactReason;
    var message = req.body.contactMessage;
    var data = {
                to: "rmausolf06@gmail.com",
                from: "Contact Form <" + email +">",
                subject: reason,
                text: "First Name: " + firstName + "\n" +
                "Last Name: " + lastName + "\n" +
                "Email: " + email +"\n" +
                "Phone Number: " + phone +"\n" +
                "Reason for Contact: " + reason + "\n" +
                "Message: " + message
            };
    mailgun.messages().send(data, function (error, body) {
        if(error){
            console.log(error);
        }
        req.flash("success", "Your contact form has been submitted! We will review it as soon as we can!");
        res.redirect("/contact");
    });
});

module.exports = router;