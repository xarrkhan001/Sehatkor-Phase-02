// Debug script to test email flow with REAL database data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import { sendProviderVerificationEmail } from './services/email.service.js';

dotenv.config();

console.log('🔍 Starting Deep Diagnostic Test...');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const runDiagnosis = async () => {
  await connectDB();

  console.log('\n--- FETCHING LATEST USER ---');
  // Find the most recently created user
  const user = await User.findOne().sort({ createdAt: -1 });

  if (!user) {
    console.log('❌ No users found in database!');
    process.exit(0);
  }

  console.log('👤 User Found:');
  console.log(`   Name:  ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role:  ${user.role}`);
  console.log(`   ID:    ${user._id}`);
  
  if (!user.email) {
    console.log('❌ CRITICAL ERROR: User has no email field!');
    process.exit(1);
  }

  console.log('\n--- ATTEMPTING TO SEND EMAIL ---');
  console.log(`📧 Sending to: ${user.email}`);
  
  try {
    const result = await sendProviderVerificationEmail(user.email, user.name, user.role);
    
    console.log('\n--- RESULT ---');
    if (result.success) {
      console.log('✅ SUCCESS: SendGrid Accepted Request');
      console.log('👉 Please check the inbox regarding: ' + user.email);
      console.log('👉 Check SPAM folder too!');
      console.log('👉 If not received, verify if the email address actually exists.');
    } else {
      console.log('❌ FAILED: Email service returned error');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.log('❌ EXCEPTION:', error.message);
  }

  // Also check specific user if provided as argument
  // usage: node debug-production-email.js user@example.com
  const specificEmail = process.argv[2];
  if (specificEmail && specificEmail.includes('@')) {
    console.log(`\n\n--- TESTING SPECIFIC EMAIL: ${specificEmail} ---`);
    const specificUser = await User.findOne({ email: specificEmail });
    if (specificUser) {
        console.log(`✅ User found in DB: ${specificUser.name}`);
        const res = await sendProviderVerificationEmail(specificUser.email, specificUser.name, specificUser.role);
        console.log('Result:', res);
    } else {
        console.log(`⚠️ User not found in DB, sending generic test...`);
        const res = await sendProviderVerificationEmail(specificEmail, "Test User", "doctor");
        console.log('Result:', res);
    }
  }

  process.exit(0);
};

runDiagnosis();
