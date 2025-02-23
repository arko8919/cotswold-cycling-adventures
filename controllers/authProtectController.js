const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//  PROTECT ROUTES (AUTH MIDDLEWARE)
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // We read token from authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // Authenticate user based on tokens sent via cookies
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401),
    );
  }

  // Verifies the JWT token and decodes its data to check if it's valid.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Finds the user associated with the decoded token ID to confirm they still exist.
  const currentUser = await User.findById(decoded.id);

  // Check if user still exists.
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  // Checks if the user changed their password after the token was issued.
  // If so, forces them to log in again for security reasons.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      // If password was changed: error
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }
  // Attaches the authenticated user to the
  //  request object for access in later middleware or route handlers.
  req.user = currentUser;

  // Makes the current user available in templates (for rendering dynamic content).
  res.locals.user = currentUser;
  next();
});

// CHECK IF USER IS LOGGED IN (For Rendering Views)
// Checks if a user is logged in by verifying the JWT cookie.
// If valid, attaches the user to res.locals for use in templates.
// If the user doesn’t exist or changed their password, proceeds without authentication.
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      const currentUser = await User.findById(decoded.id);

      if (!currentUser || currentUser.changedPasswordAfter(decoded.iat))
        return next();

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// RESTRICT ACCESS BASED ON ROLES
// Restricts access to specific user roles.
// If the user's role is not allowed, denies permission with a 403 error.
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action!', 403),
      );
    next();
  };
