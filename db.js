const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.process" });

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
