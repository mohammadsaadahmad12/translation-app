const express = require('express');

// Create the Express application instance
const app = express();

// Register global middleware: parses incoming raw text request bodies into JSON objects
app.use(express.json());

// Define the health check route
app.get('/api/health', (req, res) => {
    // Send back a 200 OK status code along with a JSON response body
    res.json({ 
        success: true, 
        message: "Server running" 
    });
});

// Export the app instance so server.js can import and run it
module.exports = app;
