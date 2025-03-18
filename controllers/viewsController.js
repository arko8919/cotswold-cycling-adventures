const Adventure = require('../models/adventureModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Sets a success alert message for booking confirmations based on query parameters.
exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later.";
  next();
};

// Renders the overview page with all adventures
exports.getOverview = catchAsync(async (req, res, next) => {
  const adventures = await Adventure.find();

  res.status(200).render('overview', {
    title: 'All adventures',
    adventures,
  });
});

// Renders a specific adventure page with reviews
exports.getAdventure = catchAsync(async (req, res, next) => {
  const adventure = await Adventure.findOne({
    slug: req.params.slug, // Finds the adventure based on the URL slug
    // Populates adventure with related reviews, showing review text, rating, and user
  }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!adventure) {
    return next(new AppError('There is no adventure with that name', 404));
  }

  res.status(200).render('adventure', {
    title: `${adventure.name} adventure`,
    adventure,
  });
});

// Renders the login page
exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = catchAsync(async (req, res, next) => {
  const { section } = req.params || 'settings'; // Default section
  if (section === 'manage-adventures') {
    const adventures = await Adventure.find();
    res.status(200).render('account', {
      title: 'Your Account',
      section,
      adventures,
    });
  } else {
    res.status(200).render('account', {
      title: 'Your Account',
      section, // Pass the section to Pug
    });
  }
});

exports.getMyAdventures = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find adventures with the returned IDs
  const adventureIDs = bookings.map((el) => el.adventure);
  const adventures = await Adventure.find({ _id: { $in: adventureIDs } });

  res.status(200).render('overview', {
    title: 'My Adventures',
    adventures,
  });
});
