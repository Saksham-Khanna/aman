const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get users (Admins see all, Members see only themselves)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      const users = await User.find({}, { password: 0 }).lean();
      return res.json(users);
    }

    // For non-admins, ONLY show themselves to prevent seeing other members
    const users = await User.find({ _id: req.user.id }, { password: 0 }).lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update user role (Admin only)
router.put('/:id/role', auth, async (req, res) => {
  try {
    const requester = await User.findOne({ _id: req.user.id });
    if (requester.role !== 'Admin') return res.status(403).json({ msg: 'Not authorized' });

    const user = await User.findOneAndUpdate({ _id: req.params.id }, { $set: { role: req.body.role } }, { new: true });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete user (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const requester = await User.findOne({ _id: req.user.id });
    if (requester.role !== 'Admin') return res.status(403).json({ msg: 'Not authorized' });

    await User.deleteOne({ _id: req.params.id });
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
