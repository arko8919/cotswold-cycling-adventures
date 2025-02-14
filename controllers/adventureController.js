const Adventure = require('../models/adventureModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Alias Routes Controller
exports.aliasTopAdventures = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllAdventures = factory.getAll(Adventure);
exports.getAdventure = factory.getOne(Adventure, { path: 'reviews' });
exports.createAdventure = factory.createOne(Adventure);
exports.updateAdventure = factory.updateOne(Adventure);
exports.deleteAdventure = factory.deleteOne(Adventure);

//////////////////////////////// BUSINESS LOGIC ////////////////////////////////
// Extract it to separate files

// Adventure statistics
exports.getAdventureStats = catchAsync(async (req, res, next) => {
  // Aggregation pipeline
  const stats = await Adventure.aggregate([
    // Stages
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      // Grouping documents together using accumulators
      $group: {
        // Purpose: Sets the group key to the uppercase version of the difficulty field.
        _id: { $toUpper: '$difficulty' },
        // Purpose: Counts the number of documents in each difficulty group.
        num: { $sum: 1 },
        // Purpose: Calculates the total number of ratings for each difficulty group.
        numRatings: { $sum: '$ratingsQuantity' },
        // Purpose: Computes the average rating for each difficulty group.
        avgRating: { $avg: '$ratingsAverage' },
        // Purpose: Determines the average price for each difficulty group.
        avgPrice: { $avg: '$price' },
        // Purpose: Finds the minimum price within each difficulty group.
        minPrice: { $min: '$price' },
        // Purpose: Finds the maximum price within each difficulty group.
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// Monthly Plan
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Adventure.aggregate([
    {
      // Deconstructs an array field into multiple documents, each containing a single element of the array.
      $unwind: '$startDates',
    },
    {
      // Filters documents to pass only those that meet specified criteria.
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      // Groups documents by a specified key and applies accumulator functions to compute aggregated values for each group.
      $group: {
        // Purpose: Groups the documents by the month extracted from the startDates field.
        _id: { $month: '$startDates' },
        // Purpose: Counts the number of adventures that start in each month.
        numAdventureStarts: { $sum: 1 },
        // Purpose: Creates an array of adventure names for each month.
        adventures: { $push: '$name' },
      },
    },
    {
      // Adds new fields to documents.
      $addFields: { month: '$_id' },
    },
    {
      //  Reshapes documents by including, excluding, or adding fields.
      $project: {
        _id: 0,
      },
    },
    {
      // Orders documents based on specified fields.
      $sort: {
        numAdventureStarts: -1,
      },
    },
    {
      // Restricts the number of documents passed to the next stage.
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getAdventuresWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // -Radius is the distance that we want to have as the radius
  // but converted to special unit called radians
  // To get a radians we need divide our distance by the radius of the earth
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400,
      ),
    );
  }

  const adventures = await Adventure.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  console.log(distance, lat, lng, unit);

  res.status(200).json({
    status: 'success',
    results: adventures.length,
    data: {
      data: adventures,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400,
      ),
    );
  }

  const distances = await Adventure.aggregate([
    // Only geospatial aggregation pipeline stage that actually exists,
    // always first one in the pipeline
    // -Requires at least one of our fields contains a geospatial index ( startLocatioN: '2dspehre' )
    {
      $geoNear: {
        // -point from which to calculate the distances.
        // -All distances will be calculated between this point that we define here,
        // and then all the start locations
        // -near point here is the point we pass into this function with  lat and lng
        near: {
          // In GeoJSON, a widely-used format for encoding geographic data structures,
          // a Point object represents a single geographic position.
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance', // field which will be created and all calculated distances will be stored
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
