import App from './app.js'
const PORT = process.env.PORT || 3000;

const initializeApp = async () => {
    try {
        const app = await App();
        if (app) {
            app.get('/', (req, res) => {
                res.send('Portal is running perfectly!!');
            });

            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        }
    } catch (err) {
        console.error('Error initializing the app:', err);
        process.exit(1);
    }
};

initializeApp();
