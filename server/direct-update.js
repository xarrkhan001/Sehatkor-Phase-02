import mongoose from "mongoose";

const directUpdate = async () => {
  try {
    console.log("Starting direct database update...");
    
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sehatkor";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    
    const db = mongoose.connection.db;
    
    // Update all collections directly
    console.log("Updating DoctorService collection...");
    const doctorResult = await db.collection('doctorservices').updateMany(
      { "ratings.rating": "Very Good" },
      { $set: { "ratings.$[elem].rating": "Good" } },
      { arrayFilters: [{ "elem.rating": "Very Good" }] }
    );
    console.log(`Updated ${doctorResult.modifiedCount} DoctorService records`);
    
    console.log("Updating ClinicService collection...");
    const clinicResult = await db.collection('clinicservices').updateMany(
      { "ratings.rating": "Very Good" },
      { $set: { "ratings.$[elem].rating": "Good" } },
      { arrayFilters: [{ "elem.rating": "Very Good" }] }
    );
    console.log(`Updated ${clinicResult.modifiedCount} ClinicService records`);
    
    console.log("Updating LaboratoryTest collection...");
    const labResult = await db.collection('laboratorytests').updateMany(
      { "ratings.rating": "Very Good" },
      { $set: { "ratings.$[elem].rating": "Good" } },
      { arrayFilters: [{ "elem.rating": "Very Good" }] }
    );
    console.log(`Updated ${labResult.modifiedCount} LaboratoryTest records`);
    
    console.log("Updating Medicine collection...");
    const medicineResult = await db.collection('medicines').updateMany(
      { "ratings.rating": "Very Good" },
      { $set: { "ratings.$[elem].rating": "Good" } },
      { arrayFilters: [{ "elem.rating": "Very Good" }] }
    );
    console.log(`Updated ${medicineResult.modifiedCount} Medicine records`);
    
    console.log("Direct database update completed!");
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    
  } catch (error) {
    console.error("Error during direct update:", error);
  }
};

directUpdate(); 