import mongoose from "mongoose";

const simpleFix = async () => {
  try {
    console.log("Starting simple rating fix...");
    
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sehatkor";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    
    const db = mongoose.connection.db;
    
    // Check each collection specifically
    const collections = ['clinicservices', 'doctorservices', 'laboratorytests', 'medicines'];
    
    for (const collectionName of collections) {
      console.log(`\nChecking collection: ${collectionName}`);
      
      try {
        // Find all documents with "Very Good" ratings
        const docs = await db.collection(collectionName).find({
          "ratings.rating": "Very Good"
        }).toArray();
        
        console.log(`Found ${docs.length} documents with "Very Good" ratings in ${collectionName}`);
        
        if (docs.length > 0) {
          // Update each document
          for (const doc of docs) {
            console.log(`Updating document ${doc._id} in ${collectionName}`);
            
            // Update all "Very Good" ratings to "Good"
            if (doc.ratings && Array.isArray(doc.ratings)) {
              let updated = false;
              doc.ratings.forEach(rating => {
                if (rating.rating === "Very Good") {
                  console.log(`  Changing "Very Good" to "Good" in rating`);
                  rating.rating = "Good";
                  updated = true;
                }
              });
              
              if (updated) {
                // Save the updated document
                await db.collection(collectionName).replaceOne(
                  { _id: doc._id },
                  doc
                );
                console.log(`  Successfully updated document ${doc._id}`);
              }
            }
          }
        }
      } catch (error) {
        console.log(`Error processing collection ${collectionName}:`, error.message);
      }
    }
    
    console.log("\nSimple fix completed!");
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    
  } catch (error) {
    console.error("Error during simple fix:", error);
  }
};

simpleFix(); 