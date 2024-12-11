const express = require('express');
const router = express.Router();
const User = require('../models/user');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Word =require('../models/Word');
const Units = require('../models/Unit');
const sauce = process.env.sauce;

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if username is taken
        const check = await User.findOne({ username: username });
        if (check) return res.status(403).json({ message: 'Username is busy' });

        // Check if email is already registered
        const mail = await User.findOne({ email: email });
        if (mail) return res.status(403).json({ message: 'Email is registered' });

        // Hash the password
        const saltRounds = 10; // Number of salt rounds, adjust as needed for security and performance
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user with hashed password
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(200).json({ message: 'Success' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something happened while signing up' });
    }
});

router.post('/signin', async (req, res) => {
    const { password, email } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ message: 'User does not exist' });
        
        const words = await Word.find();
        const units = await Units.find();
        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(403).json({ message: 'Password incorrect' });

        const id = user.username;
        const token = jwt.sign({ id: id }, sauce, { expiresIn: '12h' });

        res.status(200).json({ token: token, user, words, units });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something happened while signing in' });
    }
});

module.exports = router;
