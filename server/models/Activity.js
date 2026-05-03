const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  action: { type: String },
  target: { type: String },
  timestamp: { type: Date, default: Date.now },
  type: { type: String }
});

module.exports = mongoose.model('Activity', ActivitySchema);
