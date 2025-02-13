const express = require('express');
const router = express.Router();
const adventureController = require('../controllers/adventureController');

router.route('/').get(adventureController.getAllTours);

module.exports = router;
