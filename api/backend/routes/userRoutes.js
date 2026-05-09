const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/users
// @desc    Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/users
// @desc    Create or update a user (upsert)
router.post('/', async (req, res) => {
    try {
        const userData = req.body;
        // Upsert by email or id
        const query = userData.email ? { email: userData.email } : { id: userData.id };
        const user = await User.findOneAndUpdate(
            query,
            userData,
            { new: true, upsert: true }
        );
        res.status(201).json({ success: true, user });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
