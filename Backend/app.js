import expressApp from './config/express.js';
import connectDB from './config/database.js';
import { initGridFS } from './utils/gridFs.js';

// if (process.env.NODE_ENV !== "production") {
//     (await import('dotenv')).config();
// }
const App = async () => {
    try {
        await connectDB();
        initGridFS();
        return expressApp;
    } catch (err) {
        console.error('Error while starting the app. Error:', err);
        process.exit(1);
    }
};

export default App;
