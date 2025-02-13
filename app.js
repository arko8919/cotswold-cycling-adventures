const express = require('express');
const path = require('path');

const app = express();

const adventureRouter = require('./routes/adventureRoutes');

// Serve static files
app.use(express.static(path.join(__dirname, 'src')));

// Enable JSON parsing for incoming requests
app.use(express.json({ limit: '10kb' }));

app.use('/api/v1/adventure', adventureRouter);

module.exports = app;
