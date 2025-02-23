const jwt = require('jsonwebtoken');

// Creates a JWT token using the user's ID, a secret key,
//  and an expiration time from environment variables.
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// Generates a JWT token, stores it in a cookie, and sends it in the response.
// Hides the password before sending user data and ensures cookies are secure in production.
const createSendToken = (user, statusCode, res) => {
  // Log the user into the application by sending a token.
  const token = signToken(user);

  // Create cookie ( important when working with templates, not so much with REST API )
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    //secure: true, // Only sent on encrypted connection HTTPS
    httpOnly: true, // Cookie cannot be accessed or modified in any way by the browser
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Stores the JWT token in a cookie for secure authentication.
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

module.exports = { createSendToken };
