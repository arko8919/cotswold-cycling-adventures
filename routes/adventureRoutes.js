const express = require('express');

const adventureController = require('../controllers/adventureController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:adventureId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(
    adventureController.aliasTopAdventures,
    adventureController.getAllAdventures,
  );

router.route('/adventure-stats').get(adventureController.getAdventureStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    adventureController.getMonthlyPlan,
  );

router
  .route('/adventures-within/:distance/center/:latlng/unit/:unit')
  .get(adventureController.getAdventuresWithin);

router
  .route('/distances/:latlng/unit/:unit')
  .get(adventureController.getDistances);

router
  .route('/')
  .get(adventureController.getAllAdventures)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    adventureController.createAdventure,
  );
router
  .route('/:id')
  .get(adventureController.getAdventure)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    adventureController.updateAdventure,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    adventureController.deleteAdventure,
  );

module.exports = router;
