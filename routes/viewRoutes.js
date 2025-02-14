const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

// Routes
router.get('/', viewsController.getOverview);
router.get('/adventure/:slug', viewsController.getAdventure);

module.exports = router;
