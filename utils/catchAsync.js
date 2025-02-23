// A helper function to catch errors in async functions
// and pass them to the global error-handling middleware

module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
