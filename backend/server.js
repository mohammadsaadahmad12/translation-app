// 1. Import a package with require()
const express = require("express");
const cors = require("cors");
// 2. Calling express() creates your app instance
const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.post("/api/message", (req, res) => {
    const { role, text, targetLanguage } = req.body;
    res.json({ reply: "You said: " + text });
});
// 3. app.listen(port, callback) starts the server
app.listen(3001, () => {
  console.log("Server running on port 3001");
});