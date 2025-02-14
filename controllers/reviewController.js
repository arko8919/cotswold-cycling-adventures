const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setAdventureUserIds = (req, res, next) => {
  if (!req.body.adventure) req.body.adventure = req.params.adventureId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
