const router = require('express').Router();
const gravatar = require('gravatar');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User modal
const User = require('../../models/User');

// @route POST /api/users/register
// @desc Register user
// @access Public
router.post('/register', async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  const { email, name, password } = req.body;
  const avatar = gravatar.url(email, {
    s: '200', //size
    r: 'pg', // Rating,
    d: 'mm' // Default
  });

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ email: 'Email alreagy in use' });
    }

    const newUser = new User({
      email,
      name,
      avatar
    });

    const hash = await bcrypt.hash(password, 10);
    newUser.password = hash;
    const savedUser = await newUser.save();

    res.json(savedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

// @route POST /api/users/login
// @desc Login user /Return JWT token
// @access Public
router.post('/login', async (req, res) => {
  // Validate user input
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email, password } = req.body;

  try {
    //Find user by Email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User email not found' });
    }

    // Match passord and hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).json({ error: 'Password does not match' });
    }

    // Create jwt
    const payload = {
      id: user.id,
      name: user.name,
      avatar: user.avatar
    };

    jwt.sign(payload, keys.jwtSecret, { expiresIn: 360000 }, (err, token) => {
      res.json({
        success: true,
        token: 'Bearer ' + token
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

// @route GET /api/users/current
// @desc Return current user
// @access Privet
router.get('/current', requireAuth, (req, res) => {
  const { id, name, email, avatar } = req.user;
  res.json({ id, name, email, avatar });
});

module.exports = router;
