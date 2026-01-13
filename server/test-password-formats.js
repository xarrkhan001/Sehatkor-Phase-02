// Test with exact password format from Google
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing with different password formats...\n');

// Test 1: Current password from .env
const password1 = process.env.EMAIL_PASS;
console.log('Test 1 - Current .env password:', password1);
console.log('Length:', password1?.length);

// Test 2: Password with spaces removed (manual)
const password2 = '2jvffpcaoyajzhbx';
console.log('\nTest 2 - Manual password (no spaces):', password2);
console.log('Length:', password2.length);

// Test 3: Check if they match
console.log('\nDo they match?', password1 === password2);

async function testWithPassword(pass, testName) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing: ${testName}`);
  console.log(`${'='.repeat(50)}`);
  
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'sehatkor15@gmail.com',
        pass: pass,
      },
    });

    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ SUCCESS! Connection verified!');
    
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: '"SehatKor" <sehatkor15@gmail.com>',
      to: 'ayankhanashiq@gmail.com',
      subject: 'Test Email - Success!',
      text: 'Email is working!',
    });
    
    console.log('✅ EMAIL SENT!');
    console.log('Message ID:', info.messageId);
    return true;
    
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  }
}

// Run tests
(async () => {
  const result1 = await testWithPassword(password1, 'Password from .env');
  const result2 = await testWithPassword(password2, 'Manual password');
  
  console.log('\n' + '='.repeat(50));
  console.log('RESULTS:');
  console.log('='.repeat(50));
  console.log('Test 1 (.env):', result1 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Test 2 (manual):', result2 ? '✅ SUCCESS' : '❌ FAILED');
  
  if (!result1 && !result2) {
    console.log('\n⚠️ Both tests failed!');
    console.log('Possible issues:');
    console.log('1. App Password may need a few minutes to activate');
    console.log('2. Gmail account may have security restrictions');
    console.log('3. IP address may be blocked');
    console.log('\n💡 RECOMMENDATION: Use SendGrid instead (more reliable for production)');
  }
})();
