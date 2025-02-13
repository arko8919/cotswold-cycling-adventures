const mongoose = require('mongoose');

const adventureSchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

const Adventure = mongoose.model('Adventure', adventureSchema);

module.exports = Adventure;
