/////// ERROR DEVELOPMENT ///////
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

/////// ERROR PRODUCTION ///////
const sendErrorProd = (err, req, res) => {
  // Handle API Errors
  if (req.originalUrl.startsWith('/api')) {
    //  Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    //  Unknown error: Log and send generic response
    console.error('🚨 ERROR:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  //  Handle Rendered Website Errors
  //  Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  //  Unknown error: Log and send generic response
  console.error('🚨 ERROR:', err);
  return res.status(500).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = { sendErrorDev, sendErrorProd };
