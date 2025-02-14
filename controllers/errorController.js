const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpired = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Development  Errors
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Production Errors
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

// Error midlleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV.trim() === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    let error = Object.create(
      Object.getPrototypeOf(err),
      Object.getOwnPropertyDescriptors(err),
    );
    // Invalid ID --> example: wrong user ID
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    // Duplicate value --> example: name with that adventure already exist like
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // Does not meet the schema validation rules --> example: adventure missing name field
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    // Invalid token
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    // Token expired
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrorProd(error, res);
  }
};
