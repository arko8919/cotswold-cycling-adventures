const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const { createSendToken } = require('../utils/authUtils');

// FORGOT PASSWORD
// Handles forgotten password requests by generating a reset token and sending it via email.
// If the email fails, clears the reset token and asks the user to try again.
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  // "validateBeforeSave: false" will deactivate all the validators as we don't want to update all fields
  // Encrypted reset token was added to database
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    // Send a password reset email to the user with a reset link
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    // Clears the password reset token and expiration time if sending the reset email fails.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});

// RESET PASSWORD
// Resets the user's password if the provided reset token is valid and not expired.
//  Updates the password, clears the reset token, and logs the user in with a new JWT token.
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Encrypt token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Finds the user with the matching reset token and ensures it has not expired.
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // If token has not expired, and there is user, set the new password
  user.password = req.body.password; // Updates the user's password.
  user.passwordConfirm = req.body.passwordConfirm; //  For validation inside the Mongoose schema
  user.passwordResetToken = undefined; // Clears the reset token
  user.passwordResetExpires = undefined; // Removes the expiration time.

  await user.save();
  // Log the user in, send JWT to the client
  createSendToken(user, 200, req, res);
});

// UPDATE PASSWORD
// Updates the user's password after verifying the current password.
// Saves the new password and logs the user in with a new JWT token.
exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  // If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, req, res);
});
