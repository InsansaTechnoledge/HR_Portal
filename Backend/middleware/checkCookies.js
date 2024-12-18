import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();

const checkCookies = (req,res) => {
    const token = req.cookies.jwtAuth;

    const decode = jwt.decode(token, process.env.JWT_KEY);
}