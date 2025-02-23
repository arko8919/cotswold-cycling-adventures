const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    lowercase: true,
    // Check if email is correct format & valid ( custom validator )
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String, // Photo will be stored in file system, path is stored here
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please prove a password'],
    // Most secured passwords are the longest ones, not ones with special characters and numbers
    minlength: 8,
    // This will hide the encrypted password from client
    select: false,
    // - Never store plain passwords in database!!!
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],

    //  Important: This validation only works when **creating** (`User.create(req.body)`)
    // or **saving** (`user.save()`). It does **not** work on `findOneAndUpdate()` or `update()`.
    //
    // Why? Mongoose validators run only on `.create()` and `.save()`, but **not on updates**
    // unless you explicitly call `.save()` after updating the document.
    //
    // What does this validator do?
    // - It checks if the `passwordConfirm` field matches the `password` field.
    // - If `passwordConfirm !== password`, validation **fails** and returns an error message.
    //
    // - `el` represents the value of `passwordConfirm`
    // - `this.password` refers to the password entered by the user.

    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same.',
    },
  },
  // most of the users will not have this property in their data, if they didn't change password
  passwordChangedAt: Date, // date when password was changed
  passwordResetToken: String, // we store reset token here
  passwordResetExpires: Date, // date when password reset expire
  // Set if user account is activated or deactivated
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

////////////// ENCRYPT PASSWORD //////////////
// Hashes the password before saving the user document, but only if the password was modified.
// Removes passwordConfirm to prevent it from being stored in the database.
// - isModified() Method we can use on all documents, if certain field was modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // "bcrypt" algorithm will salt and then hash password to make it strong against brute force attack
  this.password = await bcrypt.hash(this.password, 12);

  // delete passwordConfirm field. We need it only for validation when creating user
  this.passwordConfirm = undefined;
  next();
});

// Updates the passwordChangedAt timestamp when the password is modified, ensuring tokens issued before the change become invalid.
// Subtracts 1 second to prevent issues with token issuance timing.
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

///// Query Middleware  /////
// Automatically filters out inactive users from query results before executing any find operation.
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//////// INSTANCE METHODS /////////
// Compares the entered password with the stored hashed password to check if they match.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  const result = await bcrypt.compare(candidatePassword, userPassword);

  return result;
  // return await bcrypt.compare(candidatePassword, userPassword);
};

// Checks if the user changed their password after the JWT was issued.
// If passwordChangedAt exists, converts it to a timestamp and compares it with the token's timestamp.
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // parseInt(string, radix) is a built-in function used to convert a string into an integer
    // string: The value to be converted. radix (optional): The base (2-36) of the numerical system to be used.
    // getTime() is a method of the Date object that returns the number of milliseconds since January 1, 1970 (UTC), also known as the Unix timestamp
    // getTime() --> convert to timestamp, divided by 1000, parse as integer, base is 10
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }
  // False means, not changed password after token was issued ( default )
  return false;
};

// Generates a password reset token and stores its hashed version in the database.
// Sets an expiration time of 10 minutes.
// Returns the plain reset token to be sent to the user.
// - Reset tokens are a way less dangerous attack vector that why we use build in crypto module
userSchema.methods.createPasswordResetToken = function () {
  // randomBytes(numbers_of_characters).toString('hex'); convert to hexadecimal string
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256') // sha256 is algorithm
    .update(resetToken) // update reset token
    .digest('hex'); // store it as hexadecimal

  // We just modify the data, but we didn't save it
  // We need to expire token after some time for security
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
