const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // Extracts the duplicate value from the error message
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Formats and returns a validation error message for invalid input data
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpired = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Errors in Development
const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

// Errors in Production
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

// Error middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handles errors differently for development and production.
  // In development, it shows detailed error messages.
  // In production, it checks for specific errors
  if (process.env.NODE_ENV.trim() === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    // Creates a shallow copy of the error object with the same prototype and properties
    let error = Object.create(
      Object.getPrototypeOf(err),
      Object.getOwnPropertyDescriptors(err),
    );
    // Handles errors when an invalid ID or incorrect data type is used in the database query.
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    // Handles errors when trying to create a record with a duplicate
    // value that must be unique in the database.
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // Handles errors when data does not meet the required validation rules in the database schema.
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    // Handles errors when an invalid or tampered JSON Web Token (JWT) is detected.
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    // Handles errors when a JSON Web Token (JWT) has expired and is no longer valid.
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrorProd(error, req, res);
  }
};
