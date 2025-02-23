const Adventure = require('../models/adventureModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const {
  getAdventureStats,
  getMonthlyPlan,
} = require('../services/adventureService');

const {
  uploadAdventureImages,
  resizeAdventureImages,
} = require('../middlewares/uploadMiddleware');

const {
  getAdventuresWithin,
  getDistances,
} = require('../services/adventureGeoService');

////////////////////// ADVENTURE IMAGE UPLOAD MIDDLEWARES ////////////////////////
exports.uploadAdventureImages = uploadAdventureImages;
exports.resizeAdventureImages = resizeAdventureImages;

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
exports.getAdventureStats = catchAsync(async (req, res, next) => {
  const stats = await getAdventureStats();
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: { stats },
  });
});

// Get Monthly Plan for a Given Year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const plan = await getMonthlyPlan(req.params.year * 1);
  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: { plan },
  });
});

// Controller to get adventures within a specified distance from a location.
exports.getAdventuresWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const adventures = await getAdventuresWithin(distance, latlng, unit);

  res.status(200).json({
    status: 'success',
    results: adventures.length,
    data: { adventures },
  });
});

// Controller to calculate distances from a given location to all
//  adventure start points
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const distances = await getDistances(latlng, unit);

  res.status(200).json({
    status: 'success',
    data: { distances },
  });
});
