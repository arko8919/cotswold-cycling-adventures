const { signup, login, logout } = require('./authLoginController');
const {
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('./authPasswordController');
const { protect, isLoggedIn, restrictTo } = require('./authProtectController');

module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  isLoggedIn,
  restrictTo,
};
