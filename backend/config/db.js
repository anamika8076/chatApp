const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    // Keep the HTTP server alive so the host can detect the open port and
    // expose the health endpoint while the database configuration is fixed.
    console.error("❌ DB connection failed:", error.message);
    return false;
  }
};

module.exports = connectDB;
