const jwt = require('jsonwebtoken');

// Creates a JWT token using the user's ID, a secret key,
//  and an expiration time from environment variables.
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// Generates and sends a JWT token to authenticate the user,
// storing it in a secure HTTP-only cookie.
// Also removes the password from the response for security
// before sending user data in JSON format.
const createSendToken = (user, statusCode, req, res) => {
  // Create JWT
  const token = signToken(user);

  // Set a cookie named 'jwt' with the authentication token
  res.cookie('jwt', token, {
    // Cookie expires after the specified number of days (converted to milliseconds)
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // Make the cookie accessible only via HTTP (prevents client-side JavaScript access for security)
    httpOnly: true,
    // Ensures the cookie is only sent over HTTPS by checking if the request is secure
    // or if the 'x-forwarded-proto' header indicates an HTTPS connection (useful for proxies).
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user, // make it more specific in time, which fields we actually need to send
    },
  });
};

module.exports = { createSendToken };
