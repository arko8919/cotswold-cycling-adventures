const {
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleValidationErrorDB,
  handleMongoNetworkError,
  handleRateLimitError,
  handleMulterError,
  handleJWTError,
  handleJWTExpired,
} = require('../utils/errorHandlers');

const { sendErrorDev, sendErrorProd } = require('../utils/errorResponse');

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
    // Check for known error types and handle them
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'MongoNetworkError') error = handleMongoNetworkError();
    if (error.name === 'TooManyRequestsError') error = handleRateLimitError();
    if (error.name === 'MulterError') error = handleMulterError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrorProd(error, req, res);
  }
};
