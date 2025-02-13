const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Catches synchronous errors that are not handled anywhere in your code.
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!!!');
  console.log(err.name, err.message);
  process.exit(1);
});

// Reading of variables.
dotenv.config({ path: './config.env' });

// Creating string for database variable.
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

const app = require('./app');

// Connect to database
mongoose
  .connect(DB, {
    // Deprecation warnings
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Optional: Adjust connection timeout
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: true,
  })
  .then(() => {
    console.log('DB Connection Successful!');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App Running on Port ${port}...`);
});

// Global handler for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!!!');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
