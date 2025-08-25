import mongoose from "mongoose";

const testDatabase = async () => {
  try {
    console.log("Testing database connection...");
    
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sehatkor";
    console.log("Connecting to:", MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    console.log("Database name:", mongoose.connection.db.databaseName);
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("Collections in database:");
    collections.forEach(col => console.log("-", col.name));
    
    // Check if there are any "Very Good" ratings in any collection
    console.log("\nChecking for 'Very Good' ratings in all collections...");
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments({
        "ratings.rating": "Very Good"
      });
      if (count > 0) {
        console.log(`Found ${count} records with "Very Good" ratings in ${collection.name}`);
      }
    }
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    
  } catch (error) {
    console.error("Error during database test:", error);
  }
};

testDatabase(); 