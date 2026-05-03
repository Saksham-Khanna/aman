const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');

router.get('/', auth, async (req, res) => {
  try {
    let taskQuery = {};
    if (req.user.role !== 'Admin') {
      const user = await User.findById(req.user.id);
      const userTeams = await Team.find({ members: req.user.id }).select('name');
      const teamNames = userTeams.map(t => t.name);
      
      taskQuery = {
        $or: [
          { assignee: user.name },
          { team: { $in: teamNames } },
          { team: { $in: [null, '', 'Unassigned'] } }
        ]
      };
    }

    const tasks = await Task.find(taskQuery).sort({ createdAt: -1 }).lean();
    const users = await User.find({}, { password: 0 }).lean();
    const userMap = {};
    users.forEach(u => { userMap[u.name] = u; });
    
    const enrichedTasks = tasks.map(task => ({
      ...task,
      assignee: userMap[task.assignee] || { name: task.assignee || 'Unassigned' }
    }));
    res.json(enrichedTasks);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  const { title, description, project, assignee, team, status, priority, dueDate } = req.body;
  try {
    const task = await Task.create({ 
      title, 
      description, 
      project, 
      assignee,
      team,
      status: status || 'To-Do', 
      priority: priority || 'Medium', 
      dueDate
    });

    // Log Activity
    const user = await User.findOne({ _id: req.user.id });
    await Activity.create({
      user: req.user.id,
      userName: user ? user.name : 'Unknown User',
      action: 'created task',
      target: title,
      type: 'add_task'
    });

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const oldTask = await Task.findOne({ _id: req.params.id });
    const task = await Task.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true });
    
    // Log Activity if status changed
    if (req.body.status && req.body.status !== oldTask.status) {
      const user = await User.findOne({ _id: req.user.id });
      await Activity.create({
        user: req.user.id,
        userName: user ? user.name : 'Unknown User',
        action: `marked task as ${req.body.status}`,
        target: oldTask.title,
        type: 'task_alt'
      });
    }

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id });
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    await Task.deleteOne({ _id: req.params.id });

    // Log Activity
    const user = await User.findOne({ _id: req.user.id });
    await Activity.create({
      user: req.user.id,
      userName: user ? user.name : 'Unknown User',
      action: 'deleted task',
      target: task.title,
      type: 'delete'
    });

    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
