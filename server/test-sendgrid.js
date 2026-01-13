// Test SendGrid email service
import { sendProviderVerificationEmail } from './services/email.service.js';

console.log('🧪 Testing SendGrid Email Service...\n');

const testEmail = 'ayankhanashiq@gmail.com';
const testName = 'Ayan';
const testRole = 'doctor';

console.log(`📧 Sending test email to: ${testEmail}`);
console.log(`👤 Name: ${testName}`);
console.log(`🏥 Role: ${testRole}\n`);

sendProviderVerificationEmail(testEmail, testName, testRole)
  .then(result => {
    if (result.success) {
      console.log('\n✅ SUCCESS! Email sent via SendGrid!');
      console.log('\n🎉 Check the inbox:', testEmail);
      console.log('📬 Also check spam/junk folder if not in inbox');
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
