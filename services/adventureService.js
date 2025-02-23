const Adventure = require('../models/adventureModel');
const catchAsync = require('../utils/catchAsync');

// Adventure statistics
exports.getAdventureStats = async () =>
  Adventure.aggregate([
    // Aggregation pipeline
    // Stages
    {
      // Filters adventures to include only those with an average rating of 4.5 or higher.
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
      // Sorts the results by average price in ascending order (cheapest first).
      $sort: { avgPrice: 1 },
    },
  ]);

// Monthly Plan
exports.getMonthlyPlan = async (year) =>
  await Adventure.aggregate([
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
      // Groups documents by a specified key and applies accumulator functions to
      // compute aggregated values for each group.
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
