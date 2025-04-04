const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const { deleteFile, deleteMultipleFiles } = require('../utils/fileHandler');

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
    if (req.body.priceDiscount && req.body.price) {
      if (Number(req.body.priceDiscount) >= Number(req.body.price)) {
        return next(
          new AppError('Discount price should be below regular price', 400),
        );
      }
    }

    // Parse startLocation
    if (req.body.startLocation && typeof req.body.startLocation === 'string') {
      req.body.startLocation = JSON.parse(req.body.startLocation);
    }

    // Parse locations
    if (req.body.locations) {
      req.body.locations = Array.isArray(req.body.locations)
        ? req.body.locations.map((loc) => JSON.parse(loc))
        : [JSON.parse(req.body.locations)];
    }

    // Fetch current document
    const existingDoc = await Model.findById(req.params.id);
    if (!existingDoc)
      return next(new AppError('No document found with that ID', 404));

    // Handle images deletion
    let toDelete = [];
    let filtredDoc = [];

    if (req.body.deleteImages) {
      toDelete = Array.isArray(req.body.deleteImages)
        ? req.body.deleteImages // paths ( images ) to delete are sended as array
        : [req.body.deleteImages]; // paths ( images )  to delete are sended as string
    }

    if (toDelete.length > 0) {
      // Delete files from the server
      deleteMultipleFiles(toDelete, 'adventures');
      // Remove file paths from database
      filtredDoc = existingDoc.images.filter((img) => !toDelete.includes(img));
    } else {
      filtredDoc = existingDoc.images;
    }

    // If new imageCover uploaded, delete old one
    if (req.body.imageCover && existingDoc.imageCover !== req.body.imageCover) {
      deleteFile(existingDoc.imageCover, 'adventures');
    }

    // Add new uploaded images
    req.body.images = req.body.images
      ? [...req.body.images, ...filtredDoc]
      : [...filtredDoc];

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
    if (req.body.priceDiscount && req.body.price) {
      if (Number(req.body.priceDiscount) >= Number(req.body.price)) {
        return next(
          new AppError('Discount price should be below regular price', 400),
        );
      }
    }

    // Parse locations[] from stringified JSON into real objects
    if (req.body.locations) {
      req.body.locations = Array.isArray(req.body.locations)
        ? req.body.locations.map((loc) => JSON.parse(loc))
        : [JSON.parse(req.body.locations)];
    }

    //  Parse startLocation if it exists and is a string
    if (req.body.startLocation && typeof req.body.startLocation === 'string') {
      req.body.startLocation = JSON.parse(req.body.startLocation);
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
