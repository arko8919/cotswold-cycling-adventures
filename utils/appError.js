// Custom error class that helps create clear error messages and
// properly handle different types of errors in the app.
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.details = details; // Store additional error details
    // Marks the error as an expected (operational) error
    this.isOperational = true;

    // Shows a line of code where an error happened.
    // Saves the error details to make debugging easier
    // without including unnecessary stack information.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
