import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DoctorService from './models/DoctorService.js';
import Medicine from './models/Medicine.js';
import LaboratoryTest from './models/LaboratoryTest.js';
import ClinicService from './models/ClinicService.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sehatkor_phase2').then(async () => {
  console.log('Connected to DB');
  
  const doctors = await DoctorService.countDocuments({});
  const medicines = await Medicine.countDocuments({});
  const labs = await LaboratoryTest.countDocuments({});
  const clinics = await ClinicService.countDocuments({});
  
  const staticPages = 8;
  
  console.log('--- COUNTS ---');
  console.log(`Doctors: ${doctors}`);
  console.log(`Medicines: ${medicines}`);
  console.log(`Labs: ${labs}`);
  console.log(`Clinics: ${clinics}`);
  console.log(`Static: ${staticPages}`);
  console.log(`TOTAL EXPECTED: ${doctors + medicines + labs + clinics + staticPages}`);
  
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
