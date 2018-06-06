const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 5000;

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

// DB Config
const { mongoURI } = require('./config/keys');
mongoose
  .connect(mongoURI)
  .then(() => console.log('MongdoDB Connected'))
  .catch(err => console.log(`Mongoose connection err: ${err}`));

// BodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Pasport middleware
app.use(passport.initialize());

// Config passport
require('./config/passport')(passport);

// Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

app.listen(PORT, () => console.log(`Server runnign on port ${PORT}`));
