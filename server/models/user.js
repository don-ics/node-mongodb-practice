const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

let UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: `{VALUE} is not a valid email!`
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

UserSchema.methods.toJSON = function() {
	let user = this;
	let userObject = user.toObject();

	return _.pick(userObject, ['_id', 'email']);
};

// Not arrow function because we need the 'this' keyword
// Arrow functions don't pass the "this"
UserSchema.methods.generateAuthToken = function() {
	var user = this;
	var access = 'auth';
	var token = jwt.sign({_id: user._id.toHexString, access}, 'abc123').toString();

	user.tokens = user.tokens.concat([{access, token}]);

	return user.save().then(() => {
		return token;
	});
};

// Similar to .methods but instead, it will turn it into a
// Model method rather than instance method
UserSchema.statics.findByToken = function(token) {
	// Uppercase "User" rather than "user"
	// Because instance methods get called by the individual document
	// Model methods get called by the models as the "this" binding
	var User = this;
	var decoded;

	// Try catch block will execute the "try" block first
	// And if there are any errors it will stop the program and run what's
	// inside of the catch block
	// And then it continues with your program rather than stopping everything
	try {
		decoded = jwt.verify(token, 'abc123');
	} catch (e) {

	}

	// If the token was successfully decoded that was passed in the header
	// Will return a promise. We're returning it so we can add some chaining, like adding
	// a .then call
	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
};

var User = mongoose.model('User', UserSchema);

module.exports = {User}