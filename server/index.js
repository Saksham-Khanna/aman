const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

// Database Connection
if (process.env.MONGODB_URI) {
  const dbUri = process.env.MONGODB_URI.includes('?') 
    ? process.env.MONGODB_URI.replace('/?', '/taskflow?') 
    : process.env.MONGODB_URI + '/taskflow';
    
  mongoose.connect(dbUri)
    .then(() => console.log('Successfully connected to MongoDB Atlas (taskflow)'))
    .catch(err => {
      console.error('CRITICAL: MongoDB Connection Failed!');
      console.error('Error:', err.message);
    });
} else {
  console.warn('WARNING: MONGODB_URI not found in .env. Falling back to local data (if configured).');
}

const path = require('path');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/users', require('./routes/users'));
app.use('/api/teams', require('./routes/teams'));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*path', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
