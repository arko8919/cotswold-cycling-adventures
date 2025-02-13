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
      default: 5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
      //set: (val) => Math.round(val * 10), // round ratings average
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
        // type: mongoose.Schema.ObjectId,
        // ref: 'User',
      },
    ],
  },
  {
    // toJson: { virtuals: true },
    // toObject: { virtuals: true },
  },
);

const Adventure = mongoose.model('Adventure', adventureSchema);

module.exports = Adventure;
