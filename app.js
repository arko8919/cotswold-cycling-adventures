const path = require('path');
const express = require('express');
const morgan = require('morgan');

// Security
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

// Error Handling
const AppError = require('./utils/appError');
const errorMiddleware = require('./middlewares/errorMiddleware');

// Routes
const adventureRouter = require('./routes/adventureRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// app.use((req, res, next) => {
//   console.log('🟢 Incoming Request:', req.method, req.url);
//   console.log('🔵 Headers:', req.headers);
//   console.log('🟠 Raw Body:', req.body);
//   next();
// });

// Enable 'trust proxy' to ensure Express correctly detects client IPs and protocols
// when running behind a reverse proxy (e.g., Nginx, Cloudflare, or a load balancer).
//app.enable('trust proxy');
app.set('trust proxy', false);

// Sets Pug as the template engine for rendering dynamic HTML views.
app.set('view engine', 'pug');

// Specifies the directory for Pug template files,
//  ensuring the app correctly locates and renders views.
app.set('views', path.join(__dirname, 'views'));

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from different origins.
app.use(cors());

// Enable CORS pre-flight requests for all routes, allowing browsers to send
// an OPTIONS request before making certain types of requests (e.g., PUT, DELETE).
app.options('*', cors());

// Serves static files (CSS, images, JavaScript) from the 'public' directory,
//  enabling access to assets in the frontend.
app.use(express.static(path.join(__dirname, 'public')));

// Enables HTTP request logging in 'dev' format for
//  better debugging and monitoring during development.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logs details about each incoming request
}

// Implements rate limiting to restrict each IP to 100 requests per hour,
//  enhancing security and preventing abuse.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
// Applies rate limiting to all API routes,
//  protecting against excessive requests and potential denial-of-service attacks.
app.use('/api', limiter);

// Handle incoming POST requests to the '/webhook-checkout' endpoint.
// 1. Use `express.raw({ type: 'application/json' })` to parse the request body as raw JSON data.
//    - This is required for Stripe webhooks since they send raw payloads with a signature for verification.
// 2. Pass the parsed request body to `bookingController.webhookCheckout`, which processes the webhook event.
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// Parses incoming JSON requests with a size limit of 10KB to prevent
//  excessive data payloads and enhance security.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true })); // Enables form submission parsing

// Parses cookies from incoming requests,
//  allowing easy access to stored client-side data.
app.use(cookieParser());

// Protects against NoSQL injection attacks by sanitizing user
//  input to remove potentially harmful MongoDB query operators.
app.use(mongoSanitize());

// Prevents Cross-Site Scripting (XSS) attacks by sanitizing user
//  input to remove malicious HTML and JavaScript.
app.use(xss());

// Enhances security by setting HTTP headers with Helmet, including a strict
//  Content Security Policy (CSP) to control allowed sources for scripts, styles, fonts, images
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Only allow same-origin content
        scriptSrc: [
          "'self'",
          'https://js.stripe.com',
          'https://api.mapbox.com', // Allow Mapbox scripts
          'https://cdn.jsdelivr.net', // Allow Axios
          "'unsafe-inline'", // Allow inline scripts if needed
          "'unsafe-eval'", // Allow eval (for some libraries)
        ],
        scriptSrcElem: [
          "'self'",
          'https://js.stripe.com',
          'https://api.mapbox.com',
          'https://cdn.jsdelivr.net',
          "'unsafe-inline'",
        ],
        workerSrc: ["'self'", 'blob:'], // Allow web workers & blobs
        styleSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://cdn.jsdelivr.net',
          'https://fonts.googleapis.com',
          'https://cdnjs.cloudflare.com',
          "'unsafe-inline'", // Allow inline styles
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'https://cdnjs.cloudflare.com',
        ],
        imgSrc: ["'self'", 'https://api.mapbox.com', 'data:'], // Allow images from Mapbox
        connectSrc: [
          "'self'",
          'http://127.0.0.1:8000',
          'ws://127.0.0.1:*',
          'https://api.mapbox.com',
          'https://*.tiles.mapbox.com',
          'https://events.mapbox.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com', 'https://api.mapbox.com'], // Allow embedding Mapbox if needed
        upgradeInsecureRequests: [], // Automatically upgrade HTTP to HTTPS
      },
    },
  }),
);

// Prevents HTTP parameter pollution attacks while allowing specific
//  parameters in the whitelist to support filtering and sorting.
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

// This line enables response compression in your Express app,
// reducing the size of responses and improving performance.
app.use(compression());

// Adds a requestTime property to each request object, storing the timestamp
//  of when the request was received for logging or debugging purposes.
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Defines route handlers for different parts of the application
app.use('/', viewRouter);
app.use('/api/v1/adventures', adventureRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handles undefined routes by passing a custom error message to the
//  next middleware, ensuring proper 404 error handling.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error-handling middleware to manage and format all application errors
app.use(errorMiddleware);

module.exports = app;
