const mongoose=require('mongoose');

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected successfully on ${process.env.MONGO_URI}`);
    }
    catch(err){
        console.error("database connection failed. Error:",err);
        process.exit(1);
    }
};

module.exports=connectDB;