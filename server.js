const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught exceptions (synchronous errors)
process.on('uncaughtException', (err) => {
  console.error(
    `[${new Date().toISOString()}] ❌ UNCAUGHT EXCEPTION! Server shutting down...`,
  );
  console.error(err.name, err.message);

  // Exit immediately since it's a fatal error
  process.exit(1);
});
// Loads environment variables from the specified config file to ensure
// secure and flexible configuration management.
dotenv.config({ path: './config.env' });

// Replaces the placeholder in the database connection string with the actual
// password from environment variables for secure authentication.
const connectionString = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

const app = require('./app');

// Establishes a connection to the MongoDB database using Mongoose,
// handling deprecation warnings for a stable connection.
mongoose
  .connect(connectionString, {
    // Sets the maximum time (in ms) to wait for a MongoDB server response before failing.
    serverSelectionTimeoutMS: 5000,
    // Prevents automatic index creation in production to improve performance.
    autoIndex: process.env.NODE_ENV !== 'production',
    // Sets the maximum time (in ms) to establish an initial connection.
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log(
      `✅ MongoDB connected successfully to: ${mongoose.connection.name}`,
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const port = process.env.PORT || 3000;

// Start the server
const server = app.listen(port, () => {
  console.log(
    `[${new Date().toISOString()}] ✅ Server running on port ${port}...`,
  );
});

// Handle unhandled promise rejections (asynchronous errors)
process.on('unhandledRejection', (err) => {
  console.error(
    `[${new Date().toISOString()}] ❌ UNHANDLED PROMISE REJECTION!`,
  );
  console.error(err.name, err.message);

  // Gracefully close the server before exiting
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  console.log(
    `[${new Date().toISOString()}] ⚠️ SIGTERM received. Shutting down gracefully...`,
  );

  server.close(() => {
    console.log(
      `[${new Date().toISOString()}] ✅ Server closed. Process terminated.`,
    );
  });
});
