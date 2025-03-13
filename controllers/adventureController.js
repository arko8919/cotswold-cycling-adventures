const Adventure = require('../models/adventureModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const adventureService = require('../services/adventureService');
const adventureGeoService = require('../services/adventureGeoService');

////////////////////// ALIAS /////////////////////////////////////////
exports.aliasTopAdventures = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

///////////////////////// MAIN CONTROLLERS ////////////////////////////////////
exports.getAllAdventures = factory.getAll(Adventure);
// Retrieves a single adventure and includes its related reviews.
exports.getAdventure = factory.getOne(Adventure, { path: 'reviews' });
exports.createAdventure = factory.createOne(Adventure);
exports.updateAdventure = factory.updateOne(Adventure);
exports.deleteAdventure = factory.deleteOne(Adventure);

////////////////////// BUSINESS LOGIC CONTROLLERS ////////////////////////
// Get Adventure Statistics
exports.getAdventureStats = catchAsync(async (req, res) => {
  const stats = await adventureService.getAdventureStats();
  res
    .status(200)
    .json({ status: 'success', results: stats.length, data: { stats } });
});

// Get Monthly Plan for a Given Year
exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = parseInt(req.params.year, 10);
  const plan = await adventureService.getMonthlyPlan(year);
  res
    .status(200)
    .json({ status: 'success', results: plan.length, data: { plan } });
});

// Controller to get adventures within a specified distance from a location.
exports.getAdventuresWithin = catchAsync(async (req, res) => {
  const { distance, latlng, unit } = req.params;
  const adventures = await adventureGeoService.getAdventuresWithin(
    distance,
    latlng,
    unit,
  );
  res.status(200).json({
    status: 'success',
    results: adventures.length,
    data: { adventures },
  });
});

// Controller to calculate distances from a given location to all
//  adventure start points
exports.getDistances = catchAsync(async (req, res) => {
  const { latlng, unit } = req.params;
  const distances = await adventureGeoService.getDistances(latlng, unit);
  res.status(200).json({ status: 'success', data: { distances } });
});
