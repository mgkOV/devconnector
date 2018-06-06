const express = require('express');
const mongoose = require('mongoose');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

// DB Config
const { mongoURI } = require('./config/keys');
mongoose
  .connect(mongoURI)
  .then(() => console.log('MongdoDB Connected'))
  .catch(err => console.log(`Mongoose connection err: ${err}`));

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('Hello'));

// Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

app.listen(PORT, () => console.log(`Server runnign on port ${PORT}`));
