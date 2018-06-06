const router = require('express').Router();
const passport = require('passport');
const mongoose = require('mongoose');
const requireAuth = passport.authenticate('jwt', { session: false });

// Load Profile and User model
const Profile = require('../../models/Profile');
const User = mongoose.model('users');

// @route GET /api/profile
// @desc Return user profile info
// @access Privet
router.get('/', requireAuth, async (req, res) => {
  const errors = {};
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      errors.profile = 'There is no profiel for the user';
      return res.status(404).json(errors);
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
