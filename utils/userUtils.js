// Creates a new object containing only the allowed fields from the input object,
// filtering out any unwanted properties.
exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};
