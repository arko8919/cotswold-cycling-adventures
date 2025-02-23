// Creates a new object containing only the allowed fields from the input object,
// filtering out any unwanted properties.
exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  //   obj --> The input object that needs filtering.
  // ...allowedFields --> The rest parameter collects the list of allowed field names.
  // Object.keys(obj) --> Gets all keys (field names) of the input object.
  // .forEach((el) => {...}) --> Loops through each key (el).
  // allowedFields.includes(el) --> Checks if the key is in the allowed list.
  // newObj[el] = obj[el] --> Adds only the allowed fields to newObj.
  // Returns newObj, which contains only the permitted fields.

  return newObj;
};
