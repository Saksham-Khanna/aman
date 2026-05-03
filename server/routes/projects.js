const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({}).lean();
    // Enrich with task count and progress
    const enrichedProjects = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ project: project.name });
      const completed = tasks.filter(t => t.status === 'Completed').length;
      const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
      return { ...project, taskCount: tasks.length, progress };
    }));
    res.json(enrichedProjects);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  const { name, description, color } = req.body;
  try {
    const project = await Project.create({
      name,
      description,
      color: color || 'bg-blue-500',
      createdBy: req.user.id
    });
    res.json(project);
  } catch (err) {
    console.error('Project Creation Error Details:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id });
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    await Project.deleteOne({ _id: req.params.id });
    // Also delete associated tasks? Usually yes for data integrity
    await Task.deleteMany({ project: project.name });

    res.json({ msg: 'Project and associated tasks removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
