const expressApp=require("./config/express");
const connectDB=require("./config/database");
require("dotenv").config();

const startApp=async()=>{
    try{
        await connectDB();
        return expressApp;
    }
    catch(err){
        console.error("Error while starting the app. Error:",err);
        process.exit(1);
    }
};
module.exports = startApp;
