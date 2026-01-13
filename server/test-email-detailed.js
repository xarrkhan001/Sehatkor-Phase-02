// Detailed email test with better error handling
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Detailed Email Configuration Test\n');
console.log('Configuration:');
console.log('  HOST:', process.env.EMAIL_HOST);
console.log('  PORT:', process.env.EMAIL_PORT);
console.log('  USER:', process.env.EMAIL_USER);
console.log('  PASS:', process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 4)}****${process.env.EMAIL_PASS.substring(process.env.EMAIL_PASS.length - 4)}` : 'NOT SET');
console.log('  PASS LENGTH:', process.env.EMAIL_PASS?.length || 0);
console.log('\n---\n');

async function testEmailDetailed() {
  try {
    console.log('Step 1: Creating transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true, // Enable debug output
      logger: true // Log to console
    });

    console.log('✅ Transporter created\n');

    console.log('Step 2: Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    console.log('Step 3: Sending test email...');
    const info = await transporter.sendMail({
      from: `"SehatKor Test" <${process.env.EMAIL_USER}>`,
      to: 'ayankhanashiq@gmail.com',
      subject: '✅ Test Email from SehatKor',
      html: '<h1>Success!</h1><p>Email service is working!</p>',
      text: 'Success! Email service is working!'
    });

    console.log('\n✅ SUCCESS! Email sent!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('\n❌ ERROR DETAILS:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    console.error('Response:', error.response);
    console.error('ResponseCode:', error.responseCode);
    console.error('\nFull Error:', error);
    
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check if 2-Step Verification is enabled on Gmail');
    console.log('2. Verify App Password was generated correctly');
    console.log('3. Make sure no spaces in password');
    console.log('4. Try generating a NEW App Password');
    console.log('5. Check if Gmail account is locked or has security alerts');
  }
}

testEmailDetailed();
