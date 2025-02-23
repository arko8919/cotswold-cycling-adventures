const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// We can set adventure ID and user ID using req.body or params ( nested routes )
// {{URL}}/api/v1/adventures/67abbb5f15f7a14f1c6442dd/reviews --> for adventure ID
// authController.protect --> for user ID
// Automatically sets `adventure` and `user` IDs in the request body for nested routes.
exports.setAdventureUserIds = (req, res, next) => {
  // If `adventure` is not provided in the body, set it from the URL params (`/adventures/:adventureId/reviews`).
  if (!req.body.adventure) req.body.adventure = req.params.adventureId;

  // If `user` is not provided, set it from `req.user.id` (added by `protect` middleware).
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
