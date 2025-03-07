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

module.exports = { sendErrorProd };
