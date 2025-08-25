import mongoose from "mongoose";

const aggressiveFix = async () => {
  try {
    console.log("Starting aggressive rating fix...");
    
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sehatkor";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log("Found collections:", collections.map(c => c.name));
    
    // Check each collection for "Very Good" ratings
    for (const collection of collections) {
      console.log(`\nChecking collection: ${collection.name}`);
      
      // Find all documents with "Very Good" ratings
      const docs = await db.collection(collection.name).find({
        "ratings.rating": "Very Good"
      }).toArray();
      
      console.log(`Found ${docs.length} documents with "Very Good" ratings in ${collection.name}`);
      
      if (docs.length > 0) {
        // Update each document
        for (const doc of docs) {
          console.log(`Updating document ${doc._id} in ${collection.name}`);
          
          // Update all "Very Good" ratings to "Good"
          if (doc.ratings && Array.isArray(doc.ratings)) {
            doc.ratings.forEach(rating => {
              if (rating.rating === "Very Good") {
                console.log(`  Changing "Very Good" to "Good" in rating`);
                rating.rating = "Good";
              }
            });
          }
          
          // Save the updated document
          await db.collection(collection.name).replaceOne(
            { _id: doc._id },
            doc
          );
        }
      }
    }
    
    // Also check for any documents that might have "Very Good" in other fields
    console.log("\nChecking for 'Very Good' in any field...");
    for (const collection of collections) {
      const docs = await db.collection(collection.name).find({
        $text: { $search: "Very Good" }
      }).toArray();
      
      if (docs.length > 0) {
        console.log(`Found ${docs.length} documents with "Very Good" text in ${collection.name}`);
        for (const doc of docs) {
          console.log(`Document ${doc._id}:`, JSON.stringify(doc, null, 2));
        }
      }
    }
    
    console.log("\nAggressive fix completed!");
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    
  } catch (error) {
    console.error("Error during aggressive fix:", error);
  }
};

aggressiveFix(); 