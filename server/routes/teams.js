const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Team = require('../models/Team');
const mongoose = require('mongoose');

// Get all teams (filtered for members, global for admins)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Admin') {
      // Use mongoose.Types.ObjectId for precise matching in the members array
      query = { members: new mongoose.Types.ObjectId(req.user.id) };
    }
    const teams = await Team.find(query)
      .populate('members', 'name email role')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create a team (ADMIN ONLY)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Only administrators can create teams' });
    }

    const { name, description, color, members } = req.body;
    
    // Ensure creator is always a member
    const memberIds = Array.isArray(members) ? [...members] : [];
    if (!memberIds.includes(req.user.id)) {
      memberIds.push(req.user.id);
    }

    const team = await Team.create({
      name,
      description,
      color: color || '#2563eb',
      members: memberIds,
      createdBy: req.user.id
    });

    const populated = await Team.findById(team._id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name')
      .lean();
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update a team (ADMIN ONLY)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Only administrators can manage team members' });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate('members', 'name email role')
      .populate('createdBy', 'name')
      .lean();
    
    if (!updatedTeam) return res.status(404).json({ msg: 'Team not found' });
    res.json(updatedTeam);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete a team (ADMIN ONLY)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Only administrators can delete teams' });
    }

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ msg: 'Team not found' });

    await Team.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Team removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
