var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: {type: Boolean, default: false}
});

// userSchema.static('findByName', function(name, callback){
//     return this.find({username: name}, callback);
// });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);