import User from "../models/User.js";

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
      
      await newUser.save();
      res.status(201).json({ message: 'User created successfully'});
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