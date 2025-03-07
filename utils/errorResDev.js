const sendErrorDev = (err, req, res) => {
  // Mask Stack Trace for Security in Dev API Errors
  const safeStack = process.env.SHOW_STACK_TRACE === 'true' ? err.stack : null;
  //  Handle API Errors
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: safeStack, // Only show stack if explicitly enabled
    });
  }

  // Handle Rendered Website Errors
  console.error('🔥 ERROR OCCURRED', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

module.exports = { sendErrorDev };
