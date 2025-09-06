import express from "express";
import dotenv from "dotenv";
// server.js
import app from "./app.js";
import sequelize, { testConnection } from "./config/database.js"; // instead of ./config/db.js

import app from "./app.js";

dotenv.config();

// Connect to Database
connectDB();

// Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
