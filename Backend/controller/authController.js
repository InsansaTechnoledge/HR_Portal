import User from "../models/User.js";
import generateAuthToken from '../utils/generateAuthToken.js';
import bcrypt from 'bcryptjs';

if(process.env.NODE_ENV !== "production"){
  (await import('dotenv')).config();

}

//login route
export const login=async(req, res, next)=>{
  const { userEmail, password } = req.body;

  try {
    const user = await User.findOne({ userEmail});

    if (!user) {
      return res.status(400).json({ message: 'User not found, please sign up first.' });
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
      return res.status(202).json({message: "Password invalid!"});
    }
    
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

//logout route  
export const logout = async (req, res) => {
    
    // Clear the jwtAuth cookie
    res.clearCookie('jwtAuth', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Match cookie settings
      sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
  });

    res.status(201).json({ message: 'Logged out and cookie cleared successfully' });
  
};


export const getUser = async (req,res) => {
  try{
    const userId = req.userId;
    
    const user = await User.findById(userId);
      
    res.status(201).json({message:"User found!",user: user});
  }
  catch(err){
    console.log(err);
    res.status(400).json({message:err});
  }
}