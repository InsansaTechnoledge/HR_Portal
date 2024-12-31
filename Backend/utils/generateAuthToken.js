import jwt from 'jsonwebtoken'

if(process.env.NODE_ENV !== "production"){
    (await import('dotenv')).config();
}

const generateAuthToken = (userData) => {
    try{
    const token = jwt.sign({"userId": userData.userId, "role": userData.role}, process.env.JWT_KEY);

    return token;
    }
    catch(err){
        console.log("Error generating token", err);
    }
}

export default generateAuthToken;