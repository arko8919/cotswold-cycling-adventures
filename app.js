const path = require('path');
const express = require('express');
const morgan = require('morgan');

// Security Modules
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Error Handling Modules
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Routers
const adventureRouter = require('./routes/adventureRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// Setup Pug Engine
app.set('view engine', 'pug');

// Location of views
app.set('views', path.join(__dirname, 'views'));

//// GLOBAL MIDDLEWARES ////

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  // Third-party middleware for logging in a development environment
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Enable JSON parsing for incoming requests
app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/adventures', adventureRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Handle all HTTP methods
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
