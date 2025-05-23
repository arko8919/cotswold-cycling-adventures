const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const { createSendToken } = require('../utils/authUtils');

// SIGNUP USER
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  //// Emails /////
  const url = `${req.protocol}://${req.get('host')}/me`;
  // Send a welcome email to the newly registered user with a provided URL
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

// LOGIN USER
// Handles user login by checking if email and password are provided.
//  Verifies the user exists and the password is correct.
// If successful, generates and sends a JWT token.
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // Finds a user by email and includes the password field (which is normally hidden).
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  createSendToken(user, 200, req, res);
});

// LOGOUT USER
// Logs the user out by overwriting the
//  JWT cookie with a short-lived value and sending a success response.
exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(0),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};
