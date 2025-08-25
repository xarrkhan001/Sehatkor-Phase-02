import mongoose from "mongoose";
import DoctorService from "./models/DoctorService.js";
import ClinicService from "./models/ClinicService.js";
import LaboratoryTest from "./models/LaboratoryTest.js";
import Medicine from "./models/Medicine.js";

const testMigration = async () => {
  try {
    console.log("Testing database connection...");
    
    // Test connection
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sehatkor";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    
    // Check for existing "Very Good" ratings
    const doctorServices = await DoctorService.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${doctorServices.length} DoctorService records with "Very Good" ratings`);
    
    const clinicServices = await ClinicService.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${clinicServices.length} ClinicService records with "Very Good" ratings`);
    
    const labTests = await LaboratoryTest.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${labTests.length} LaboratoryTest records with "Very Good" ratings`);
    
    const medicines = await Medicine.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${medicines.length} Medicine records with "Very Good" ratings`);
    
    // Update them
    if (doctorServices.length > 0) {
      console.log("Updating DoctorService records...");
      for (const service of doctorServices) {
        service.ratings.forEach(rating => {
          if (rating.rating === "Very Good") {
            rating.rating = "Good";
          }
        });
        await service.save();
      }
    }
    
    if (clinicServices.length > 0) {
      console.log("Updating ClinicService records...");
      for (const service of clinicServices) {
        service.ratings.forEach(rating => {
          if (rating.rating === "Very Good") {
            rating.rating = "Good";
          }
        });
        await service.save();
      }
    }
    
    if (labTests.length > 0) {
      console.log("Updating LaboratoryTest records...");
      for (const test of labTests) {
        test.ratings.forEach(rating => {
          if (rating.rating === "Very Good") {
            rating.rating = "Good";
          }
        });
        await test.save();
      }
    }
    
    if (medicines.length > 0) {
      console.log("Updating Medicine records...");
      for (const medicine of medicines) {
        medicine.ratings.forEach(rating => {
          if (rating.rating === "Very Good") {
            rating.rating = "Good";
          }
        });
        await medicine.save();
      }
    }
    
    console.log("Migration completed!");
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    
  } catch (error) {
    console.error("Error during migration:", error);
  }
};

testMigration(); 