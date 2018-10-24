const mongoose = require("mongoose"),
    express = require("express"),
    Event = require("../models/event"),
    router = express.Router(),
    // keys = require("../keys"),
    middleware = require("../middleware");

const api_key = process.env.MAILGUN_API_KEY;
const DOMAIN = 'mg.bobbymdesigns.com';
const mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

router.get("/contact", function(req, res) {
    res.render("contact");
});

router.post("/contact", function(req, res){
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const phone = req.body.phone;
    const reason = req.body.contactReason;
    const message = req.body.contactMessage;
    const data = {
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
        const events = []
        const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
    const date = req.body.date;
    const time = req.body.time;
    const name = req.body.name;
    const location = req.body.location;
    const newEvent = {date: date, time: time, name: name, location: location}
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