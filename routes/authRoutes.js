const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }
        
        // Create new user (In a real app, passwords should be hashed with bcrypt)
        user = new User({
            id: email, // Using email as the unique ID since Firebase is removed
            email,
            password,
            name,
            phone
        });
        
        await user.save();
        res.status(201).json({ success: true, message: 'User registered successfully', user });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user or admin
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Hardcoded Admin Verification
        if (email === 'admin@subhub.com' && password === 'admin123') {
            return res.status(200).json({ success: true, role: 'admin', email });
        }
        
        // Normal User Verification
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        
        res.status(200).json({ success: true, role: 'user', email });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during login' });
    }
});

// @route   PUT /api/auth/reset-password
// @desc    Reset user password
router.put('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        const user = await User.findOneAndUpdate(
            { email },
            { password: newPassword },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during password reset' });
    }
});

module.exports = router;
