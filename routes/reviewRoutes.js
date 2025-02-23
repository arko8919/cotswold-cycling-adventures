const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// -"mergeParams" By default each router only have access to the parameters of their specific routes,
// -To get access to that parameter in this outer router we need physically merge the parameters
// route from adventureRoutes.js  --> router.use('/:adventureId/reviews', reviewRouter);
// --> will be redirected to this router

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setAdventureUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
