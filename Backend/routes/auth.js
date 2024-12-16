import express from 'express';
import passport from 'passport';
import User from "../models/User.js";
import crypto from 'crypto';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  const { userEmail, password } = req.body;

  try {
    let user = await User.findOne({ userEmail });

    if (!user) {
      return res.redirect('/signup'); 
    }

    // User found, authenticate with passport
    passport.authenticate('local', {
      failureRedirect: '/',
      failureFlash: true,
      session: true,
    })(req, res, next);

  } catch (error) {
    console.error('Error during login process:', error);
    res.status(500).json({ error: 'Failed to process login' });
  }
}, (req, res) => {
  // Successful login
  res.status(200).json({ message: 'Login successful', user: req.user });
});

// Signup route (used if user does not exist)
router.post('/signup', async (req, res) => {
  try {
    const { username, userEmail, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ userEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate a random userId using crypto
    const userId = crypto.randomBytes(16).toString('hex'); // 16-byte random ID    

    // Create new user
    const newUser = new User({
      userId,
      username: username || userEmail.split('@')[0], // Use email prefix as username if not provided
      userEmail,
      password,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error('Error during signup process:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
