const express = require('express');
const path = require('path');
const morgan = require('morgan');

const app = express();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const adventureRouter = require('./routes/adventureRoutes');

// Serve static files
app.use(express.static(path.join(__dirname, 'src')));

if (process.env.NODE_ENV === 'development') {
  // Third-party middleware for logging in a development environment
  app.use(morgan('dev'));
}

// Enable JSON parsing for incoming requests
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/adventures', adventureRouter);

// Handle all HTTP methods
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
