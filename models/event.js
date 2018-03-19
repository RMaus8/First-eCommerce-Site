var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var eventSchema = new mongoose.Schema({
    date: Date,
    time: String,
    name: String,
    location: String
});

module.exports = mongoose.model("Event", eventSchema);