const AppError = require('./appError');

// Handles errors when an invalid ID or incorrect data type is used in the database query.
const handleCastErrorDB = (err) => {
  const path = err.path === '_id' ? 'ID' : err.path;
  const value = err.value ?? 'Unknown'; // Prevents "undefined"

  const message = `Invalid ${path}: ${value}. Please provide a valid ${path}.`;
  return new AppError(message, 400);
};

// Handles errors when trying to create a record with a duplicate
// value that must be unique in the database.
const handleDuplicateFieldsDB = (err) => {
  // Extract field and value from MongoDB error
  const field = Object.keys(err.keyValue)[0]; // Get the field name
  const value = err.keyValue[field]; // Get the duplicate value

  const message = `Duplicate field "${field}" with value "${value}". Please use a different value!`;
  return new AppError(message, 400);
};

// Handles errors when data does not meet the required validation rules in
//  the database schema.
const handleValidationErrorDB = (err) => {
  if (!err.errors) return new AppError('Invalid input data.', 400);

  // Extract error messages
  const errors = Object.values(err.errors).map((el) => el.message);

  // Limit errors shown (optional: max 3 errors for better readability)
  const formattedErrors =
    errors.slice(0, 3).join('. ') + (errors.length > 3 ? '...' : '');

  const message = `Invalid input data. ${formattedErrors}`;
  return new AppError(message, 400);
};

// Handle MongoDB network errors (e.g., database connection lost)
const handleMongoNetworkError = () =>
  new AppError('Database connection lost. Please try again later.', 503);

// Handle API rate-limiting errors (too many requests in a short time)
const handleRateLimitError = () =>
  new AppError('Too many requests. Please try again later.', 429);

// Handle file upload errors from Multer (e.g., file too large, invalid format)
const handleMulterError = (err) =>
  new AppError(`File upload error: ${err.message}`, 400);

// Handles errors when an invalid or tampered JSON Web Token (JWT) is detected.
const handleJWTError = () =>
  new AppError('Invalid or expired token. Please log in again!', 401);

// Handles errors when a JSON Web Token (JWT) has expired and is no longer valid.
const handleJWTExpired = () =>
  new AppError(
    'Your session has expired! Please log in again to continue.',
    401,
  );

module.exports = {
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleValidationErrorDB,
  handleMongoNetworkError,
  handleRateLimitError,
  handleMulterError,
  handleJWTError,
  handleJWTExpired,
};
