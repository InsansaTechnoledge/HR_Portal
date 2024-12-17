import User from "../models/User.js";
import bcrypt from "bcrypt";


//create user
export const createUser=async(req,res) => {
    try {
      const { userName, userEmail, password, role } = req.body;
  
      const existingUser = await User.findOne({ userEmail });
      if (existingUser) {
        return res.status(200).json({ message: 'User already exists' });
      }
      else{
  
        
        const newUser = new User({
        userName: userName,
        userEmail,
        password,
        role
      });
      
      const new_user = await newUser.save();
      res.status(201).json({ message: 'User created successfully', new_user: new_user});
      }
    } catch (error) {
      console.error('Error during signup process:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
}

//get user
export const getUser = async (req,res) => {
    try{
        const users = await User.find();
        res.status(200).send(users);
    }
    catch(err){
        console.log(err)
        res.status(500).json({message: err})
    }
}

//delete user
export const deleteUser = async (req,res) => {
    try{
        const {id} = req.params;
        const deletedUser = await User.findOneAndDelete({"userId": id});

        res.status(200).json({message: "User deleted successfully!"});
    }
    catch(err){
        
    }
}


// Edit login info route
export const editLoginInfo = async (req, res) => {
  const { userEmail, currentPassword, newPassword, newEmail } = req.body;

  if (!userEmail || !currentPassword) {
    return res.status(400).json({ message: "Current email and password are required." });
  }

  try {
    // Fetch user by current email
    const user = await User.findOne({ userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found. Invalid email." });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid current password." });
    }

    // Update email (if newEmail is provided)
    if (newEmail) {
      const emailExists = await User.findOne({ userEmail: newEmail });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use. Please use another email." });
      }
      user.userEmail = newEmail;
    }

    // Update password (if newPassword is provided)
    if (newPassword) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;
    }

    // Save updated user info
    await user.save();

    res.status(200).json({ message: "Login information updated successfully.", user: { userEmail: user.userEmail } });
  } catch (error) {
    console.error("Error updating login info:", error);
    res.status(500).json({ message: "Failed to update login information. Please try again." });
  }
};
