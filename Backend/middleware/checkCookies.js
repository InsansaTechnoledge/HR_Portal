import jwt from 'jsonwebtoken';
import User from '../models/User.js';

if(process.env.NODE_ENV !== "production"){
    (await import('dotenv')).config();
}

const checkCookies = async (req,res,next) => {
    let token = req.cookies?.jwtAuth;
        // Fallback to Authorization header if cookie is missing
        if (!token) {
            const authHeader =
                req.headers.authorization || req.headers.Authorization;

            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1].trim();
            }
        }

    if(!token){
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try{
        const decode = jwt.verify(token, process.env.JWT_KEY);
        req.userId = decode.userId;
        
        // Fetch full user object and attach to req.user
        const user = await User.findById(decode.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }
        req.user = user;
        next();
    }
    catch(err){
        console.log(err);
        res.status(401).json({ message: 'Invalid token.' });
    }
}

export default checkCookies;