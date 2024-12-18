import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();

const checkCookies = (req,res,next) => {
    const token = req.cookies.jwtAuth;

    if(!token){
        return res.json({ message: 'Access denied. No token provided.' });
    }

    try{

        const decode = jwt.verify(token, process.env.JWT_KEY);
        req.userId=decode.userId;
        next();
    }
    catch(err){
        console.log(err);
        res.status(400).json({ message: 'Invalid token.' });
    }
}

export default checkCookies;