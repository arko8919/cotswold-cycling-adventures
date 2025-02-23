const Adventure = require('../models/adventureModel');
const AppError = require('../utils/appError');

// Parses and validates latitude/longitude coordinates.
const parseCoordinates = (latlng) => {
  if (!latlng)
    throw new AppError(
      'Please provide latitude and longitude in the format lat,lng',
      400,
    );
  const [lat, lng] = latlng.split(',').map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lng))
    throw new AppError('Invalid latitude or longitude values.', 400);
  return [lat, lng];
};

// Radius represents the distance we want to use, but it needs to be converted
//  to a special unit called radians.
// To convert a distance into radians, we divide it by the Earth's radius.

// Converts the distance into radians based on the selected unit
// (miles or kilometers) for geospatial queries.
const convertToRadians = (distance, unit) =>
  unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

// Retrieves adventures within a given distance from a location.
const getAdventuresWithin = async (distance, latlng, unit) => {
  const [lat, lng] = parseCoordinates(latlng);
  const radius = convertToRadians(distance, unit);
  // Finds adventures whose start location is within a
  // specified radius using geospatial spherical coordinates.
  return await Adventure.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
};

//Retrieves distances from a given location to all adventure start points.
const getDistances = async (latlng, unit) => {
  const [lat, lng] = parseCoordinates(latlng);
  // Converts distances from meters to either miles or kilometers, depending on the selected unit.
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  // Uses geospatial aggregation to calculate distances from a given location to all adventure start points.
  // The $geoNear stage must be the first in the pipeline and requires a geospatial index.
  // The result includes only the distance and adventure name for a simplified response.
  return await Adventure.aggregate([
    {
      // In GeoJSON, a widely-used format for encoding geographic data structures
      // A "Point" object represents a single geographic position.
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distance', // Stores the calculated distance in the "distance" field.
        distanceMultiplier: multiplier, // Converts the distance to the selected unit (miles or kilometers).
      },
    },
    { $project: { distance: 1, name: 1 } },
  ]);
};

module.exports = {
  getAdventuresWithin,
  getDistances,
};
