const mongoose = require('mongoose');

// This function handles the asynchronous connection to MongoDB
const connectDB = async () => {
    try {
        // Try to connect using the hidden URI from your .env file
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        // If it works, log the success message
        console.log(`Database connected: ${conn.connection.host}`);
    } catch (error) {
        // If it fails, log the exact error message
        console.error(`Database connection error: ${error.message}`);
        
        // Stop the entire application immediately because it cannot run without a database
        process.exit(1);
    }
};

// Export the function so other files (like server.js) can use it
module.exports = connectDB;