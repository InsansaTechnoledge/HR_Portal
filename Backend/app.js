import expressApp from './config/express.js';
import connectDB from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const App = async () => {
    try {
        await connectDB();
        return expressApp;
    } catch (err) {
        console.error('Error while starting the app. Error:', err);
        process.exit(1);
    }
};

export default App;
