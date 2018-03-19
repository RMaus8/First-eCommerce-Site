var mongoose = require("mongoose"),
    express = require("express"),
    Event = require("../models/event"),
    router = express.Router(),
    mailgun = require("mailgun-js"),
    middleware = require("../middleware");

var api_key = process.env.MAILGUN_API_KEY;
var DOMAIN = 'mg.bobbymdesigns.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});


// router.get("/about", function(req, res) {
//     res.render("about/index");
// });

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

router.get("/events", function(req, res){
    Event.find(function(err, allEvents){
        var events = []
        var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        allEvents.forEach(function(event){
            events.push(event);
        })
        events.sort(function(a, b){
            return a.date - b.date;
        })
        if(err){
            console.log(err);
        } else {
            res.render("events", {events: events, month: month, day: weekday});
        }
        
    })
})

router.get("/new_event", function(req, res) {
    res.render("newEvent");
})

router.post("/new_event", function(req, res){
    var date = req.body.date;
    var time = req.body.time;
    var name = req.body.name;
    var location = req.body.location;
    var newEvent = {date: date, time: time, name: name, location: location}
    Event.create(newEvent, function(err, newlyCreatedEvent){
        if(err){
            req.flash("error", err);
        } else {
            req.flash("success", "new event created");
            res.redirect("/events");
        }
    })
})

router.delete("/new_event", middleware.isLoggedInAdmin, function(req, res){
    Event.findByIdAndRemove(req.body.id, function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect("/events");
        }
    });
});

module.exports = router;