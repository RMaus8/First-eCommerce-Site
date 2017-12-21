var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: {type:String, unique: true, required: true},
    password: String,
    firstName: {type:String, required: true},
    lastName: {type:String, required: true},
    email: {type:String, unique: true, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default: false}
});

// userSchema.static('findByName', function(name, callback){
//     return this.find({username: name}, callback);
// });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);