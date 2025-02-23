const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Catches synchronous errors that are not handled anywhere in your code.
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!!!');
  console.log(err.name, err.message);
  process.exit(1);
});

// Loads environment variables from the specified config file to ensure
// secure and flexible configuration management.
dotenv.config({ path: './config.env' });

// Replaces the placeholder in the database connection string with the actual
// password from environment variables for secure authentication.
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

const app = require('./app');

// Establishes a connection to the MongoDB database using Mongoose,
// handling deprecation warnings for a stable connection.
mongoose
  .connect(DB, {
    // Ensures MongoDB connection uses the new URL parser
    // to avoid deprecation warnings and improve parsing reliability.
    useNewUrlParser: true,
    // Enables the new MongoDB driver topology engine to handle server
    //  discovery and monitoring more efficiently, reducing connection issues.
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Data Base Connection Successful!!!');
  });

// Starts the server on the specified port from environment
// variables or defaults to 3000, ensuring flexibility for different environments.
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App Running on Port ${port}...`);
});

// Catches unhandled promise rejections, logs the error details,
// and gracefully shuts down the server to prevent unexpected crashes.
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED PROMISE REJECTION!!!');
  console.log(err.name, err.message);
  // We give time to the server to finish all the requests
  // that are pending or being handled at that time
  server.close(() => {
    process.exit(1);
  });
});
