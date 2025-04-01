const express = require('express');

const adventureController = require('../controllers/adventureController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const {
  uploadAdventureImages,
  resizeAdventureImages,
} = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Redirects requests to the review routes when an adventureId is included in the URL,
//  allowing nested routes for reviews related to adventures.
router.use('/:adventureId/reviews', reviewRouter);

// Defines a route to get the top 5 cheapest adventures by applying
// a filter before fetching all adventures.
router
  .route('/top-5-cheap')
  .get(
    adventureController.aliasTopAdventures,
    adventureController.getAllAdventures,
  );

// Defines a route to get statistics about adventures, such as average ratings,
//  prices, and difficulty levels.
router.route('/adventure-stats').get(adventureController.getAdventureStats);

// Defines a route to get a monthly adventure plan for a given year,
// allowing access only to admins and guides.
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    adventureController.getMonthlyPlan,
  );

// Defines a route to find adventures within a given distance from a specific location,
// using latitude, longitude, and the chosen unit (miles or kilometers).
router
  .route('/adventures-within/:distance/center/:latlng/unit/:unit')
  .get(adventureController.getAdventuresWithin);

// Defines a route to calculate distances from a given location to all adventures,
// using latitude, longitude, and the chosen unit (miles or kilometers).
router
  .route('/distances/:latlng/unit/:unit')
  .get(adventureController.getDistances);

// Defines routes for getting all adventures and creating a new adventure.
// Only admins and lead guides can create an adventure, and authentication is required
router
  .route('/')
  .get(adventureController.getAllAdventures)
  .post(
    authController.protect,
    uploadAdventureImages,
    resizeAdventureImages,
    authController.restrictTo('admin', 'lead-guide'),
    adventureController.createAdventure,
  );

// Defines routes for getting, updating, and deleting a specific adventure by ID.
// Only admins and lead guides can update or delete an adventure, and authentication is required.
router
  .route('/:id')
  .get(adventureController.getAdventure)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    uploadAdventureImages,
    resizeAdventureImages,
    (req, res, next) => {
      console.log('✅ FINAL BODY:', req.body);
      console.log('✅ FINAL FILES:', req.files);
      next();
    },
    adventureController.updateAdventure,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    adventureController.deleteAdventure,
  );

module.exports = router;
