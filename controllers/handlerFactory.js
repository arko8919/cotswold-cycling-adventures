const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const { filterObj } = require('../utils/userUtils');

// Delete adventure document
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
    });
  });

// Update adventure document
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //  Return the new document after the update has been applied
      runValidators: true, // Ensures that the update operation respects the schema's validation rules.
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// Create adventure document
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.body.locations) {
      req.body.locations = Array.isArray(req.body.locations)
        ? req.body.locations.map((loc) => JSON.parse(loc)) // Parse each JSON string into an object
        : [JSON.parse(req.body.locations)]; // If it's a single value, parse it and wrap it in an array
    }

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// Show adventure document with specified ID
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // Finds a document in the database by its ID.
    let query = Model.findById(req.params.id);
    // If population options are provided ( reviews ), fetch related data for the query.
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No adventure found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    // -To allow for nested GET reviews on tour
    // ( check first 2 lines of reviewController.js and this line here)
    // IF there is tourId in URL then new object is created with that ID, only match tour wit that ID.
    // IF it is regular API call without nested route, then it show all reviews
    if (req.params.adventureId) filter = { adventure: req.params.adventureId };

    // Applies filtering, sorting, field limiting, and pagination to the query based on
    //  request parameters, then retrieves the results.
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      reqestedAt: req.requestTime,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
