// Quick email test script
// Run with: node test-email.js

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('🔍 Testing Email Configuration...\n');

console.log('Environment Variables:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET*** (length: ' + process.env.EMAIL_PASS.length + ')' : '❌ NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('\n---\n');

async function testEmail() {
  try {
    console.log('Creating transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"SehatKor Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email from SehatKor Production',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">✅ Email Configuration Working!</h2>
          <p>This is a test email from your SehatKor production server.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Server:</strong> ${process.env.FRONTEND_URL}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you received this email, your SMTP configuration is working correctly.
          </p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n🎉 All tests passed! Email is working correctly.');
    console.log('\n📧 Check your inbox:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('\n❌ Email test failed!');
    console.error('Error:', error.message);
    
    if (error.code) console.error('Error Code:', error.code);
    if (error.command) console.error('Failed Command:', error.command);
    if (error.response) console.error('Server Response:', error.response);
    if (error.responseCode) console.error('Response Code:', error.responseCode);
    
    console.log('\n🔧 Troubleshooting:');
    if (error.message.includes('Invalid login')) {
      console.log('- Your Gmail App Password is incorrect or expired');
      console.log('- Generate a new one at: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('- Cannot connect to Gmail SMTP server');
      console.log('- Check if port 587 is open');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('- Connection timed out');
      console.log('- Your server might be blocking outbound SMTP connections');
    }
  }
}

testEmail();
