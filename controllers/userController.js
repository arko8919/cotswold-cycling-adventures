const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const { filterObj } = require('../utils/userUtils');
const {
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../middlewares/uploadMiddleware');

////////////////////// USER IMAGE UPLOAD MIDDLEWARES ////////////////////////
exports.uploadUserPhoto = uploadUserPhoto;
exports.resizeUserPhoto = resizeUserPhoto;

// "/me" endpoint
// Is good practice to implement a slash me endpoint in any API.
// Endpoint where a use can retrieve his own data. Get ID from currently logged user
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Updates the logged-in user's name and email but prevents password updates through this route.
// Filters the request body to allow only name and email fields.
// Updates the user and returns the updated data in the response.
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400,
      ),
    );
  }

  // The update object includes only allowed fields (name and email).
  // Filters the request data to ensure only permitted fields are updated.
  const filteredBody = filterObj(req.body, 'name', 'email');

  // If a file was uploaded, save its filename in the 'photo' field of filteredBody
  if (req.file) filteredBody.photo = req.file.filename;

  // Since we're updating non-sensitive data, we use findByIdAndUpdate.
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Deactivates the user's account instead of deleting it by setting active: false.
// Sends a 204 status response (no content) to confirm the action.
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  // 204 - deleted
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Placeholder for user creation
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined. Please us /signup instead',
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do not update passwords with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
