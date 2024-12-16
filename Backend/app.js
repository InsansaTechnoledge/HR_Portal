import expressApp from './config/express';
import connectDB from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const startApp = async () => {
    try {
        await connectDB();
        return expressApp;
    } catch (err) {
        console.error('Error while starting the app. Error:', err);
        process.exit(1);
    }
};

export default startApp;
