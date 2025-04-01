const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Store uploaded files in memory as buffers instead of saving them to disk
const multerStorage = multer.memoryStorage();

// Allow only image files to be uploaded; reject non-image files with an error message
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// Configure multer with custom storage and file filter to handle file uploads
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Middleware to handle single file upload with the field name 'photo'
exports.uploadUserPhoto = upload.single('photo');

// Processes and resizes user profile images.
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Process the uploaded image using Sharp:
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/assets/users/${req.file.filename}`);

  next();
});

// Middleware to handle multiple file uploads with different field names:
// exports.uploadAdventureImages = upload.fields([
//   {
//     name: 'imageCover',
//     maxCount: 1,
//   },
//   {
//     name: 'images',
//     maxCount: 3,
//   },
// ]);

// Upload any form fields and files
exports.uploadAdventureImages = upload.any();

// Middleware to process and resize uploaded adventure images
exports.resizeAdventureImages = catchAsync(async (req, res, next) => {
  //if (!req.files.imageCover || !req.files.images) return next();

  // Generate MongoDB ID manually if there is no ID on req body
  const id = req.params.id || new mongoose.Types.ObjectId();
  // Assign new id
  req.body._id = id;

  if (!req.files || req.files.length === 0) return next();

  const imageCoverFile = req.files.find(
    (file) => file.fieldname === 'imageCover',
  );
  const imageFiles = req.files.filter((file) => file.fieldname === 'images');

  if (imageCoverFile) {
    // Cover image filename
    req.body.imageCover = `adventure-${id}-${Date.now()}-cover.jpeg`;
    // Handle image upload and processing:
    await sharp(imageCoverFile.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/assets/adventures/${req.body.imageCover}`);
  }
  // Images
  if (imageFiles.length > 0) {
    req.body.images = [];

    // Process and save multiple uploaded images concurrently:
    await Promise.all(
      imageFiles.map(async (file, i) => {
        const filename = `adventure-${id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/assets/adventures/${filename}`);

        req.body.images.push(filename);
      }),
    );
  }
  next();
});
