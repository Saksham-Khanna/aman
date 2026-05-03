const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');

// Get all activities (filtered for privacy)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Admin') {
      const Team = require('../models/Team');
      const myTeams = await Team.find({ members: req.user.id }).select('members');
      const sharedMemberIds = new Set();
      sharedMemberIds.add(req.user.id);
      myTeams.forEach(t => t.members.forEach(m => sharedMemberIds.add(m.toString())));
      
      query = { user: { $in: Array.from(sharedMemberIds) } };
    }
    const activities = await Activity.find(query).sort({ timestamp: -1 }).limit(20);
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
