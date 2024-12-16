import express from 'express';
import passport from 'passport';
import User from "../models/User.js";
import crypto from 'crypto';

const router = express.Router();


// Route to log in with userId and password
router.post(
  "/login",  (req, res, next) => {
        console.log("Login route hit");
        console.log(req.body);
        next();
      },
      passport.authenticate('local', {    
        successRedirect: process.env.CLIENT_BASE_URL, // Redirect on successful login
        failureRedirect: `${process.env.CLIENT_BASE_URL}/login`, // Redirect on failed login
        failureFlash: true, // Show error message if login fails
        session: true, // Maintain session after login
      })
  
);

// Signup route to create a new user with random userId
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Generate a random userId using crypto
    const userId = crypto.randomBytes(16).toString('hex'); // 16-byte random ID    

    // Create new user
    const newUser = new User({
      userId,
      username,
      password,
    });
    console.log(newUser);

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
