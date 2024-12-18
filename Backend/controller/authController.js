import passport from 'passport';
import User from "../models/User.js";
import dotenv from 'dotenv';
import generateAuthToken from '../utils/generateAuthToken.js';
dotenv.config();

//login route
export const login=async(req, res, next)=>{
  const { userEmail, password } = req.body;

  try {
    const user = await User.findOne({ userEmail });

    if (!user) {
      return res.status(400).json({ message: 'User not found, please sign up first.' });
    }
    
    // passport.authenticate('local', async (err, user, info) => {
    //   if (err) {
    //     return next(err);
    //   }
    //   if (!user) {
    //     return res.status(401).json({ message: 'Invalid credentials' }); 
    //   }

    //   // If authentication is successful, log the user in and create a session
    //   req.login(user, (err) => {
    //     if (err) {
    //       return next(err); 
    //     }
    //     return res.status(200).json({ message: 'Login successful', user: req.user });
    //   });
    // })(req, res, next); // Call passport.authenticate

    const token = generateAuthToken(user);

    res.cookie("jwtAuth", token, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiration
      httpOnly: true,                                            // Prevents client-side JS access
      secure: process.env.NODE_ENV !== 'development',            // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'development' ? "Lax" : "None" // Adjust for environment
  });
  
    console.log("cookie created");
    res.status(200).json({ message: 'Login successful', user: user });

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
export const logout = async (req, res) => {
  req.logout((err) => { //Use req.session.destroy inside the req.logout callback
      if (err) {
          return res.status(500).json({ message: 'Error logging out' });
      }
      console.log('Logged out successfully');
      
      req.session.destroy((err) => { // Callback to handle potential errors
          if (err) {
              console.error("Error destroying session:", err); // Log the error
              return res.status(500).json({ message: 'Error destroying session' });
          }
          res.clearCookie('connect.sid', { 
              httpOnly: true, // Ensure cookie is only accessible via HTTP
              secure: process.env.NODE_ENV === 'production', // Set 'secure' flag in production
              sameSite: 'strict' //  Prevent CSRF attacks
          });
          console.log('Session destroyed');
          res.status(200).json({ message: 'Logged out successfully' });
      });

  });
};

export const getUser = async (req,res) => {
  try{
    const userId = req.userId;
    
    const user = await User.findOne({"userId":userId});
      
    res.status(201).json({message:"User found!",user: user});
  }
  catch(err){
    console.log(err);
    res.status(400).json({message:err});
  }
}