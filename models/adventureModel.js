const mongoose = require('mongoose');
const slugify = require('slugify');

const adventureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Adventure name is missing'],
      unique: true,
      trim: true,
      maxlength: [41, 'A adventure name must have less then 40 characters'],
      minlength: [5, 'A adventure name must have more then 5 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      require: [true, 'Adventure duration is missing'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Adventure group size is missing'],
    },
    difficulty: {
      type: String,
      required: [true, 'Adventure difficulty is missing'],

      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Choose difficulty: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
      set: (val) => Math.round(val * 10) / 10, // round ratings average
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Adventure price is missing'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; // check if discount is larger then price
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Adventure summary is missing'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Adventure cover image is missing'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // hide from output
    },
    startDates: [Date],
    secretAdventure: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJson: { virtuals: true },
    toObject: { virtuals: true },
  },
);

adventureSchema.index({ price: 1, ratingsAverage: -1 });
adventureSchema.index({ slug: 1 });
adventureSchema.index({ startLocation: '2dsphere' });

////// VIRTUAL PROPERTIES ///////

//  Convert duration from days to weeks (virtual property)
adventureSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

adventureSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'adventure',
  localField: '_id',
});

////// DOCUMENT MIDDLEWARE ///////

// Generate a slug from the name before saving a new document
adventureSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

////// QUERY MIDDLEWARE //////

// Exclude secret adventures from query results
adventureSchema.pre(/^find/, function (next) {
  this.find({ secretAdventure: { $ne: true } });
  next();
});

adventureSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });

  next();
});

// adventureSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretAdventure: { $ne: true } } });
//   next();
// });

const Adventure = mongoose.model('Adventure', adventureSchema);

module.exports = Adventure;
