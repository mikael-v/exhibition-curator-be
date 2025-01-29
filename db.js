const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.process" });

let dbConnection;

const connectDB = async () => {
  if (dbConnection) return dbConnection;
  try {
    const client = new MongoClient(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    await client.connect();
    dbConnection = client.db("exhibition-data-collection");
    console.log("MongoDB connected successfully");
    return dbConnection;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
