import dotenv from "dotenv";
dotenv.config();
import express from "express";
import databaseService from "./config/database"; // Import the correct service

const app = express();
app.use(express.json());

// Connect to database
databaseService.connect().catch(err => {
    console.error("Failed to connect to database:", err);
});

app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});