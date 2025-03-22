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
    distance: {
      type: Number,
      require: [true, 'Adventure distance is missing'],
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
          // "this" will not work on update.
          // "this" only points to current doc on NEW document creation
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
    startDates: {
      type: [Date],
      default: Date.now(),
    },
    secretAdventure: {
      type: Boolean,
      default: false,
    },
    // - "startLocation" is not document itself, it just an object describing a certain point on earth
    // - MongoDB uses a special format GeoJSON to specify Geospatial data
    startLocation: {
      type: {
        type: String,
        default: 'Point', // Other: polygons, lines or other geometries
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
    // Stores an array of user IDs that reference guides,
    // enabling relationships between adventures and users.
    guides: [
      {
        // We expect a type of each of the elements
        //  in the guides array to be a MongoDB ID
        type: mongoose.Schema.ObjectId,
        // We establish references between different data sets in Mongoose.
        // We establish relationship between user nad adventure model
        ref: 'User',
      },
    ],
  },
  {
    // Ensures virtual fields are included when converting a document to JSON or an object.
    toJson: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Creates an index to optimize queries that sort by price (ascending) and average rating (descending).
adventureSchema.index({ price: 1, ratingsAverage: -1 });
// Creates an index on the slug field to speed up queries searching for adventures by their slug
adventureSchema.index({ slug: 1 });
// Creates a geospatial index on startLocation to enable location-based queries like finding nearby adventures.
adventureSchema.index({ startLocation: '2dsphere' });

////// VIRTUAL PROPERTIES ///////

//  Convert duration from days to weeks (virtual property)
adventureSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Creates a virtual field reviews that links reviews to an adventure.
// It references the Review model, matching adventure in the review model with _id in the adventure model.
adventureSchema.virtual('reviews', {
  ref: 'Review', // name of the model we want ref
  foreignField: 'adventure', // This is the name of the field in the review model.
  localField: '_id', // location where ID is stored here in this current adventure model
});

////// DOCUMENT MIDDLEWARE ///////

// Generate a slug from the name before saving a new document
adventureSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

////// QUERY MIDDLEWARE //////

// Automatically filters out secret adventures from query results before executing any find operation.
adventureSchema.pre(/^find/, function (next) {
  this.find({ secretAdventure: { $ne: true } });
  next();
});

// -Populate - to replace the fields that we referenced with the actual related data
// -Populate process always happens in a query. Also impact performance
// -We want to populate to field called guides in our tour model.
// -"guide" field only contains the reference. Populate will fill field with actual data

// Automatically populates the guides field with user details,
// excluding __v and passwordChangeAt, before executing any find query.
adventureSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt', // remove this fields from the query
  });

  next();
});

// Ensures secret adventures are excluded from aggregation queries by adding a filter at the beginning of the pipeline.
// adventureSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretAdventure: { $ne: true } } });
//   next();
// });

// Creating model using schema
const Adventure = mongoose.model('Adventure', adventureSchema);

module.exports = Adventure;
