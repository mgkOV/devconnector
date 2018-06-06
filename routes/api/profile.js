const router = require('express').Router();
const passport = require('passport');
const mongoose = require('mongoose');
const requireAuth = passport.authenticate('jwt', { session: false });

// Load Validation
const validateProfileInput = require('../../validation/profile');

// Load Profile and User model
const Profile = require('../../models/Profile');
const User = mongoose.model('users');

// @route GET /api/profile
// @desc Return user profile info
// @access Private
router.get('/', requireAuth, async (req, res) => {
  const errors = {};
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if (!profile) {
      errors.profile = 'There is no profiel for the user';
      return res.status(404).json(errors);
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json(err);
  }
});

// @route GET /api/handle/:handle
// @desc Return user profile info
// @access Public
router.get('/handle/:handle', async (req, res) => {
  const errors = {};
  try {
    const profile = await Profile.findOne({
      handle: req.params.handle
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      errors.handle = 'There is not profile for the user';
      return res.status(404).json(errors);
    }
    return res.json(profile);
  } catch (e) {
    res.status(404).json({ profile: 'There is no profile' });
  }
});

// @route GET /api/user/:user_id
// @desc Return user profile info
// @access Public
router.get('/user/:user_id', async (req, res) => {
  const errors = {};
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      errors.handle = 'There is not profile for the user';
      return res.status(404).json(errors);
    }
    return res.json(profile);
  } catch (e) {
    res.status(404).json({ profile: 'There is no profile' });
  }
});

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', async (req, res) => {
  const errors = {};
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    if (!profiles) {
      errors.noprofile = 'There are no profiles';
      return res.status(404).json(errors);
    }

    res.json(profiles);
  } catch (e) {
    res.status(404).json({ profile: 'There are no profiles' });
  }
});

// @route POST /api/profile
// @desc Create user profile
// @access Private
router.post('/', requireAuth, async (req, res) => {
  const profileFields = {};
  profileFields.user = req.user.id;

  const { errors, isValid } = validateProfileInput(req.body);

  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  // Get fields
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername)
    profileFields.githubusername = req.body.githubusername;

  // Skills - Spilt into array
  if (typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills
      .split(',')
      .map(skill => skill.trim());
  }

  // Social
  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

  try {
    // Check if profile exists
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update profile
      const updatedProfile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );

      return res.json(updatedProfile);
    }

    //Check if handle exists
    profile = await Profile.findOne({ handle: req.body.handle });
    if (profile) {
      errors.handle = 'That handle already exists';
      return res.status(400).json(errors);
    }

    // Create profile
    profile = await new Profile(profileFields).save();
    return res.json(profile);
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
