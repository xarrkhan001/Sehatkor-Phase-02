import mongoose from "mongoose";
import DoctorService from "./models/DoctorService.js";
import ClinicService from "./models/ClinicService.js";
import LaboratoryTest from "./models/LaboratoryTest.js";
import Medicine from "./models/Medicine.js";

const migrateRatings = async () => {
  try {
    console.log("Starting rating migration...");
    
    // Update DoctorService ratings
    const doctorServices = await DoctorService.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${doctorServices.length} DoctorService records with "Very Good" ratings`);
    
    for (const service of doctorServices) {
      service.ratings.forEach(rating => {
        if (rating.rating === "Very Good") {
          rating.rating = "Good";
        }
      });
      await service.save();
    }
    
    // Update ClinicService ratings
    const clinicServices = await ClinicService.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${clinicServices.length} ClinicService records with "Very Good" ratings`);
    
    for (const service of clinicServices) {
      service.ratings.forEach(rating => {
        if (rating.rating === "Very Good") {
          rating.rating = "Good";
        }
      });
      await service.save();
    }
    
    // Update LaboratoryTest ratings
    const labTests = await LaboratoryTest.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${labTests.length} LaboratoryTest records with "Very Good" ratings`);
    
    for (const test of labTests) {
      test.ratings.forEach(rating => {
        if (rating.rating === "Very Good") {
          rating.rating = "Good";
        }
      });
      await test.save();
    }
    
    // Update Medicine ratings
    const medicines = await Medicine.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${medicines.length} Medicine records with "Very Good" ratings`);
    
    for (const medicine of medicines) {
      medicine.ratings.forEach(rating => {
        if (rating.rating === "Very Good") {
          rating.rating = "Good";
        }
      });
      await medicine.save();
    }
    
    console.log("Rating migration completed successfully!");
  } catch (error) {
    console.error("Error during rating migration:", error);
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Connect to database
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sehatkor";
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");
  
  await migrateRatings();
  
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

export default migrateRatings; 