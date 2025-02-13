const Adventure = require('../models/adventureModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllAdventures = factory.getAll(Adventure);
exports.getAdventure = factory.getOne(Adventure, { path: 'reviews' });
exports.createAdventure = factory.createOne(Adventure);
exports.updateAdventure = factory.updateOne(Adventure);
exports.deleteAdventure = factory.deleteOne(Adventure);
