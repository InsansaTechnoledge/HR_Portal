import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const generateAuthToken = (userData) => {
    try{
    const token = jwt.sign({"userName": userData.userName, "role": userData.role}, process.env.JWT_KEY);

    return token;
    }
    catch(err){
        console.log("Error generating token", err);
    }
}

export default generateAuthToken;