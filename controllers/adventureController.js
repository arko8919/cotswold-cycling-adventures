const Adventure = require('../models/adventureModel');

exports.getAllTours = async (req, res) => {
  const adventures = await Adventure.find();
  console.log('TEST!!' + adventures);

  res.status(200).json({
    status: 'success',
    data: {
      adventures,
    },
  });
};
