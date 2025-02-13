const AppError = require('../utils/appError');

// Handle Error Functions
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // We could also use err.message
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // Object.values()  --> extract all values from an object's properties and return them as an array.
  // It could be more then just one message as we client didn't specify more than one required field
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
  // Operational, trusted error: send a message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown errors: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

// Error midlleware
module.exports = (err, req, res, next) => {
  // Default status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // I had to use trim() otherwise I couldn't set NODE_ENV properly ( It work on course video without trim() )[!?]
  if (process.env.NODE_ENV.trim() === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    // let error = Object.assign({}, err); or let error = { ...err };
    // <<< ---  We can't create hard copy this way. It return undefined ( It work on course video ) [!?]
    // Hard copy of error
    let error = Object.create(
      Object.getPrototypeOf(err),
      Object.getOwnPropertyDescriptors(err),
    );
    // Invalid ID --> example: wrong user ID
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    // Duplicate value --> example: name with that tour already exist like
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // Does not meet the schema validation rules --> example: tour missing name field
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    // Invalid token
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    // Token expired
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrorProd(error, res);
  }
};
