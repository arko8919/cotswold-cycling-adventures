const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// Apply the alerts middleware to set booking confirmation messages
//  for all routes in this router.
router.use(viewsController.alerts);

router.get(
  '/',
  authController.isLoggedIn, // Checks if the user is logged in
  viewsController.getOverview, // Renders the homepage
);
router.get(
  '/adventure/:slug',
  authController.isLoggedIn, // Checks if the user is logged in
  viewsController.getAdventure, // Renders the adventure details page
);
// Route for the login page
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
// Route for the user account page (protected, requires login)
router.get(
  '/me/:section/:id?',
  authController.protect,
  viewsController.getAccount,
);

// Route for viewing a user's booked adventures (protected)
router.get(
  '/my-adventures',
  authController.protect, // Restricts access to logged-in users only
  viewsController.getMyAdventures, // Renders the user's booked adventures page
);

module.exports = router;
