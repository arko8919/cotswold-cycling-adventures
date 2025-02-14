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
    adventure: {
      type: mongoose.Schema.ObjectId,
      ref: 'Adventure',
      required: [true, 'Review must belong to a adventure'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    // -If we have virtual property, field that is not stored in the
    // database but calculated using some other value we want it to show
    // whenever there is output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ adventure: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calcsAverageRatings = async function (adventureId) {
  const stats = await this.aggregate([
    {
      $match: { adventure: adventureId },
    },
    {
      $group: {
        _id: '$adventure',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Adventure.findByIdAndUpdate(adventureId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Adventure.findByIdAndUpdate(adventureId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcsAverageRatings(this.adventure);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcsAverageRatings(this.r.adventure);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
