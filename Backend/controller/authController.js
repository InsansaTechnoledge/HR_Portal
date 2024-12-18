import passport from 'passport';
import User from "../models/User.js";
import dotenv from 'dotenv';
import generateAuthToken from '../utils/generateAuthToken.js';
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
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' }); 
      }

      // If authentication is successful, log the user in and create a session
      req.login(user, (err) => {
        if (err) {
          return next(err); 
        }
        return res.status(200).json({ message: 'Login successful', user: req.user });
      });
    })(req, res, next); // Call passport.authenticate

    // const token = generateAuthToken(user);

    // res.cookie("jwtAuth", token, {
    //   expires: new Date(Date.now() + 31536000),
    //   httpOnly: false,
    //   // secure: process.env.NODE_ENV !== 'development',
    //   // sameSite: process.env.NODE_ENV === 'development' ? 'Lax' : 'None'
    //   secure: true,
    //   sameSite: "None"
    // });
    // console.log("cookie created");

  } catch (error) {
    console.error('Error during login process:', error);
    res.status(500).json({ error: 'Failed to process login' });
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
};
