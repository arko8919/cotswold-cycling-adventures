const fs = require('fs');
const path = require('path');

/**
 * Delete a single file from a given folder (default: 'adventures').
 * @param {string} filename - The name of the file to delete
 * @param {string} [folder='adventures'] - The folder inside /public/assets/.
 */

exports.deleteFile = (filename, folder = 'adventures') => {
  if (!filename) return;
  const filePath = path.join(__dirname, `../public/assets/${folder}`, filename);

  fs.unlink(filePath, (err) => {
    if (err)
      console.error(`❌ Failed to delete file: ${filename}`, err.message);
  });
};

/**
 * Delete multiple files from a given folder (default: 'adventures').
 * @param {string[]} filenames - An array of filenames to delete.
 * @param {string} [folder='adventures']
 */
exports.deleteMultipleFiles = (filenames = [], folder = 'adventures') => {
  filenames.forEach((filename) => exports.deleteFile(filename, folder));
};
