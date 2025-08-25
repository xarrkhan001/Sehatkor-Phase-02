import mongoose from "mongoose";
import DoctorService from "./models/DoctorService.js";
import ClinicService from "./models/ClinicService.js";
import LaboratoryTest from "./models/LaboratoryTest.js";
import Medicine from "./models/Medicine.js";

const fixAllRatings = async () => {
  try {
    console.log("Starting comprehensive rating fix...");
    
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sehatkor";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    
    // Find ALL services with any "Very Good" ratings
    console.log("Searching for all services with 'Very Good' ratings...");
    
    // DoctorService
    const doctorServices = await DoctorService.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${doctorServices.length} DoctorService records with "Very Good" ratings`);
    
    // ClinicService
    const clinicServices = await ClinicService.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${clinicServices.length} ClinicService records with "Very Good" ratings`);
    
    // LaboratoryTest
    const labTests = await LaboratoryTest.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${labTests.length} LaboratoryTest records with "Very Good" ratings`);
    
    // Medicine
    const medicines = await Medicine.find({
      "ratings.rating": "Very Good"
    });
    console.log(`Found ${medicines.length} Medicine records with "Very Good" ratings`);
    
    // Update DoctorService
    if (doctorServices.length > 0) {
      console.log("Updating DoctorService records...");
      for (const service of doctorServices) {
        let updated = false;
        service.ratings.forEach(rating => {
          if (rating.rating === "Very Good") {
            rating.rating = "Good";
            updated = true;
            console.log(`Updated DoctorService ${service._id}: "Very Good" -> "Good"`);
          }
        });
        if (updated) {
          await service.save();
        }
      }
    }
    
    // Update ClinicService
    if (clinicServices.length > 0) {
      console.log("Updating ClinicService records...");
      for (const service of clinicServices) {
        let updated = false;
        service.ratings.forEach(rating => {
          if (rating.rating === "Very Good") {
            rating.rating = "Good";
            updated = true;
            console.log(`Updated ClinicService ${service._id}: "Very Good" -> "Good"`);
          }
        });
        if (updated) {
          await service.save();
        }
      }
    }
    
    // Update LaboratoryTest
    if (labTests.length > 0) {
      console.log("Updating LaboratoryTest records...");
      for (const test of labTests) {
        let updated = false;
        test.ratings.forEach(rating => {
          if (rating.rating === "Very Good") {
            rating.rating = "Good";
            updated = true;
            console.log(`Updated LaboratoryTest ${test._id}: "Very Good" -> "Good"`);
          }
        });
        if (updated) {
          await test.save();
        }
      }
    }
    
    // Update Medicine
    if (medicines.length > 0) {
      console.log("Updating Medicine records...");
      for (const medicine of medicines) {
        let updated = false;
        medicine.ratings.forEach(rating => {
          if (rating.rating === "Very Good") {
            rating.rating = "Good";
            updated = true;
            console.log(`Updated Medicine ${medicine._id}: "Very Good" -> "Good"`);
          }
        });
        if (updated) {
          await medicine.save();
        }
      }
    }
    
    // Also check for any "Good" ratings that should be "Fair"
    console.log("Checking for old 'Good' ratings that should be 'Fair'...");
    
    // This is optional - only if you want to migrate old "Good" ratings to "Fair"
    // Uncomment the following section if you want to do this migration
    
    /*
    const oldGoodDoctorServices = await DoctorService.find({
      "ratings.rating": "Good"
    });
    console.log(`Found ${oldGoodDoctorServices.length} DoctorService records with old "Good" ratings`);
    
    for (const service of oldGoodDoctorServices) {
      let updated = false;
      service.ratings.forEach(rating => {
        if (rating.rating === "Good") {
          rating.rating = "Fair";
          updated = true;
          console.log(`Updated DoctorService ${service._id}: "Good" -> "Fair"`);
        }
      });
      if (updated) {
        await service.save();
      }
    }
    */
    
    console.log("Comprehensive rating fix completed!");
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    
  } catch (error) {
    console.error("Error during rating fix:", error);
  }
};

fixAllRatings(); 