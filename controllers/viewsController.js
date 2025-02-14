const Adventure = require('../models/adventureModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  const adventures = await Adventure.find();

  res.status(200).render('overview', {
    title: 'All adventures',
    adventures,
  });
});

exports.getAdventure = catchAsync(async (req, res) => {
  const adventure = await Adventure.findOne({
    slug: req.params.slug,
  }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  res.status(200).render('adventure', {
    title: 'The Step Hills',
    adventure,
  });
});
