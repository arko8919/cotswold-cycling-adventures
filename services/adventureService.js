const Adventure = require('../models/adventureModel');

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
        // Sets the group key to the uppercase version of the difficulty field.
        _id: { $toUpper: '$difficulty' },
        // Counts the number of documents in each difficulty group.
        num: { $sum: 1 },
        // Calculates the total number of ratings for each difficulty group.
        numRatings: { $sum: '$ratingsQuantity' },
        // Computes the average rating for each difficulty group.
        avgRating: { $avg: '$ratingsAverage' },
        // Determines the average price for each difficulty group.
        avgPrice: { $avg: '$price' },
        // Finds the minimum price within each difficulty group.
        minPrice: { $min: '$price' },
        // Finds the maximum price within each difficulty group.
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
      // Breaks down the "startDates" array so that each document contains only one date.
      // This ensures each adventure with multiple start dates is counted separately.
      $unwind: '$startDates',
    },
    {
      // Filters adventures to include only those with start dates within the specified year.
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      // Groups adventures by the month they start and aggregates relevant data
      $group: {
        // Groups the documents by the month extracted from the startDates field.
        _id: { $month: '$startDates' },
        // Counts the number of adventures that start in each month.
        numAdventureStarts: { $sum: 1 },
        // Creates an array of adventure names for each month.
        adventures: { $push: '$name' },
      },
    },
    {
      // Adds a "month" field to each document, mirroring the "_id" field for clarity.
      $addFields: { month: '$_id' },
    },
    {
      // Removes the "_id" field from the output, keeping only relevant fields.
      $project: {
        _id: 0,
      },
    },
    {
      // Sorts the results in descending order based on the number of adventure starts.
      $sort: {
        numAdventureStarts: -1,
      },
    },
    {
      // Ensures that only 12 documents (one per month) are included in the final output.
      $limit: 12,
    },
  ]);
