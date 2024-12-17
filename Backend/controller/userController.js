import User from "../models/User";

//signup route
export const signup=async(req,res) => {
    try {
      const { userName, userEmail, password, role } = req.body;
  
      // Check if user already exists
      const existingUser = await User.findOne({ userEmail });
      if (existingUser) {
        return res.status(200).json({ message: 'User already exists' });
      }
      else{
  
        
        // Create new user
        const newUser = new User({
        userName: userName || userEmail.split('@')[0], // Use email prefix as username if not provided
        userEmail,
        password,
        role
      });
      
      await newUser.save();
      res.status(201).json({ message: 'User created successfully'});
      }
    } catch (error) {
      console.error('Error during signup process:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
}

export const getUser = async (req,res) => {
    
}

export const deleteUser = async (req,res) => {
    try{
        const {id} = req.params;
        const deletedUser = User.findOneAndDelete({userId: id});

        res.status(200).json({message: "User deleted successfully!"});
    }
    catch(err){

    }
}