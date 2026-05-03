const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  project: { type: String },
  assignee: { type: String },
  team: { type: String },
  status: { type: String, default: 'To-Do' },
  priority: { type: String, default: 'Medium' },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
