// Quick test to verify email service works
import { sendProviderVerificationEmail } from './services/email.service.js';

console.log('🧪 Testing email service...\n');

const testEmail = 'ayankhanashiq@gmail.com'; // The email from screenshot
const testName = 'Ayan';
const testRole = 'doctor';

console.log(`📧 Sending test email to: ${testEmail}`);
console.log(`👤 Name: ${testName}`);
console.log(`🏥 Role: ${testRole}\n`);

sendProviderVerificationEmail(testEmail, testName, testRole)
  .then(result => {
    if (result.success) {
      console.log('\n✅ SUCCESS! Email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('\n🎉 Check the inbox:', testEmail);
    } else {
      console.log('\n❌ FAILED! Email could not be sent');
      console.log('Error:', result.error);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  });
