import passport from 'passport';
import User from "../models/User.js";
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

//login route
export const login=async(req, res, next)=>{
  const { userEmail, password } = req.body;

  try {
    let user = await User.findOne({ userEmail });

    if (!user) {
      return res.status(400).json({ message: 'User not found, please sign up first.' });
    }
    passport.authenticate('local', async (err, user, info) => {
      if (err) {
        return next(err); // Handle any errors that occur during authentication
      }
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' }); // Handle failed login
      }

      // If authentication is successful, log the user in and create a session
      req.login(user, (err) => {
        if (err) {
          return next(err); // Handle any errors that occur during session creation
        }
        return res.status(200).json({ message: 'Login successful', user: req.user });
      });
    })(req, res, next); // Call passport.authenticate

  } catch (error) {
    console.error('Error during login process:', error);
    res.status(500).json({ error: 'Failed to process login' });
  }
}

//signup route
export const signup=async(req,res) => {
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
}

//check session route
export const checkSession =async (req, res) => {  
    if (req.isAuthenticated()) {
      res.status(200).json({ message: 'Session valid', user: req.user });
    } else {
      res.status(401).json({ message: 'No valid session found' }); // Explicit 401 for clarity
    }
  }

//logout route  
export const logout =async (req, res) => {
  req.logout((err) => {
      if (err) {
          return res.status(500).json({ message: 'Error logging out' });
      }
      req.session.destroy(() => {
          res.clearCookie('connect.sid');  // Clear session cookie
          res.status(200).json({ message: 'Logged out successfully' });
      });
  });
}