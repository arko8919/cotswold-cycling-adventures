const mongoose = require('mongoose');
const Adventure = require('./adventureModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Each review documents know exactly what adventure it belongs.
    adventure: {
      type: mongoose.Schema.ObjectId,
      ref: 'Adventure',
      required: [true, 'Review must belong to a adventure'],
    },
    // Each review documents know exactly to which user it belongs.
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Ensures a user can only leave one review per tour by
// enforcing a unique combination of tour and user.
reviewSchema.index({ adventure: 1, user: 1 }, { unique: true });

// Automatically populates the user field in reviews
// with the user's name and photo before executing any find query.
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// Calculates the average rating and total number of reviews for an adventure.
// Updates the adventure's ratingsQuantity and ratingsAverage fields based on the latest review data.
// If no reviews exist, sets default values (ratingsQuantity: 0, ratingsAverage: 4.5).
reviewSchema.statics.calcsAverageRatings = async function (adventureId) {
  const stats = await this.aggregate([
    {
      // Selects only reviews where adventure matches the given adventureId
      $match: { adventure: adventureId },
    },
    {
      $group: {
        _id: '$adventure', // Groups reviews by adventure ID
        nRating: { $sum: 1 }, // Counts number of reviews for the adventure
        avgRating: { $avg: '$rating' }, // Calculates the average rating
      },
    },
  ]);

  // Finds a adventure document by its _id (adventureId).
  // Updates the ratingsQuantity (number of reviews).
  // Updates the ratingsAverage (average rating score).
  if (stats.length > 0) {
    await Adventure.findByIdAndUpdate(adventureId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // default
    await Adventure.findByIdAndUpdate(adventureId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// After saving a review, recalculates the average rating and total
// number of reviews for the associated adventure.
// This ensures real-time updates whenever reviews are added or removed.
// this.constructor Refers to the model that created this document (Review model)
reviewSchema.post('save', function () {
  this.constructor.calcsAverageRatings(this.adventure);
});

// Before executing a findOneAndUpdate or findOneAndDelete query,
// retrieves the current review document and stores it in this.currentDocument for later use.
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.currentDocument = await this.findOne();
  next();
});

// After updating or deleting a review,
// recalculates the average rating and total number of reviews for the associated adventure.
reviewSchema.post(/^findOneAnd/, async function () {
  await this.currentDocument.constructor.calcsAverageRatings(
    this.currentDocument.adventure,
  );
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
