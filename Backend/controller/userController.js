import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

//create user
export const createUser=async(req,res) => {
    try {
      const { userName, userEmail, password, role } = req.body;
      // Validate required fields
      if (!userName || !userEmail || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }

      const existingUser = await User.findOne({ userEmail });
      if (existingUser) {
        return res.status(200).json({ message: 'User already exists' });
      }
      
      const newUser = new User({
        userName: userName,
        userEmail,
        password,
        role: role || "user"
      });
      
      const new_user = await newUser.save();
      res.status(201).json({ message: 'User created successfully', new_user: new_user});
    } catch (error) {
      console.error('Error during signup process:', error);
      res.status(500).json({ error: error.message || 'Failed to create user' });
    }
}

//get user
export const getUser = async (req,res) => {
  try{
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);
    const fields = req.query.fields || "userName userEmail role"; // keep response light by default

    const users = await User.find({}, fields.split(",").join(" "))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean({ defaults: true, getters: false });

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
        
        // Validate if id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        const deletedUser = await User.findByIdAndDelete(id);

        res.status(200).json({message: "User deleted successfully!"});
    }
    catch(err){
        
    }
}

export const changePassword = async (req,res) => {
  try{
    const requester = req.user;
    if (!requester) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {id} = req.params;
    
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const user = await User.findById(id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(402).json({ message: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );
    
    res.status(200).json({message: "Password updated successfully!"});

  }
  catch(err){
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Failed to change password. Please try again." });
  }
}


export const editLoginInfo = async (req, res) => {
  try {
    const { id } = req.params; 
    const { userName, userEmail, newPassword, currentPassword, role } = req.body;

    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const requester = req.user;
    if (!requester) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("Requester:",requester)
    // Only superAdmin may change roles
    if (role && requester.role !== "superAdmin") {
      return res.status(403).json({ message: "Only superAdmin can change roles." });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build updates
    const updateFields = {};
    if (userName) updateFields.userName = userName;

    if (userEmail) {
      const emailExists = await User.findOne({ userEmail, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use. Please use another email." });
      }
      updateFields.userEmail = userEmail;
    }

    if (role) updateFields.role = role;

    if (newPassword) {
      // require currentPassword in payload
      if (!currentPassword || !currentPassword.trim()) {
        return res.status(400).json({ message: "Current password is required to change password." });
      }

      if (requester.role !== "admin" && requester.role !== "superAdmin") {
        if (requester._id.toString() !== id.toString()) {
          return res.status(403).json({
            message: "You can only change your own password. Ask an admin or superAdmin to reset others' passwords."
          });
        }
      }

      // Compare provided currentPassword with target user's stored hash
      const isMatch = await bcrypt.compare(currentPassword, targetUser.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password doesn't match. Please verify the current password." });
      }

      // Hash and set new password
      const hashed = await bcrypt.hash(newPassword, 10);
      updateFields.password = hashed;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const safeUser = {
      _id: updatedUser._id,
      userName: updatedUser.userName,
      userEmail: updatedUser.userEmail,
      role: updatedUser.role,
    };

    return res.status(200).json({ message: "User updated successfully", user: safeUser });
  } catch (err) {
    console.error("Error in editLoginInfo:", err);
    return res.status(500).json({ message: "Failed to update user" });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query; // optional ISO date strings for leaveHistory range filtering

    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const matchId = new mongoose.Types.ObjectId(id);

    // When date filters are provided, use aggregation to trim leaveHistory server-side
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;

      const pipeline = [
        { $match: { _id: matchId } },
        {
          $project: {
            password: 0,
            leaveHistory: {
              $filter: {
                input: "$leaveHistory",
                as: "leave",
                cond: {
                  $and: [
                    fromDate ? { $gte: ["$$leave.startDate", fromDate] } : true,
                    toDate ? { $lte: ["$$leave.endDate", toDate] } : true,
                  ],
                },
              },
            },
          },
        },
      ];

      const result = await User.aggregate(pipeline).exec();
      if (!result.length) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ message: "User fetched", user: result[0] });
    }

    const user = await User.findById(id).select("-password").lean({ defaults: true, getters: false });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User fetched", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || err });
  }
};


// Add leave for user
export const addLeaveToUser = async (req, res) => {
  try {
    const { id }  = req.params;
    const leaveHistory = req.body;
    
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $push: { leaveHistory: leaveHistory } },
      { new: true }
    );

    

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(201).json({ message: "Leave added", updatedUser });
  } catch (err) {
    console.log("Error in addLeaveToUser:", err);
    res.status(400).json({ message: err.message || err });
  }
}

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, userEmail } = req.body;

    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { userName, userEmail },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully!", user: updatedUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
}
