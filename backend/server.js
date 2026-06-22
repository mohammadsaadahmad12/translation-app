// 1. Load environment variables FIRST so they are available immediately
require('dotenv').config();

// 2. Import external configurations and modules
const app = require('./app'); // Imports the Express app configuration
const connectDB = require('./src/config/database'); // Imports the database connection function

// 3. Define the network port from .env (fallback to 5000 if not set)
const PORT = process.env.PORT || 5000;

// 4. Initialize the asynchronous database connection
connectDB();

// 5. Start the web server to listen for network requests
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Health check ready at: http://localhost:${PORT}/api/health`);
});
