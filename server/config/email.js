import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  if (process.env.DEBUG_EMAIL === 'true') {
    console.log('Initializing email transporter (gmail service)');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send contact form email
export const sendContactEmail = async ({
  name,
  email,
  phone,
  subject,
  category,
  message,
}) => {
  try {
    const transporter = createTransporter();
    const toAddress = process.env.CONTACT_RECEIVER || "abuzarktk123@gmail.com";

    const safe = (v) => String(v || "").toString();
    const title = safe(subject) || `New ${safe(category) || "General"} inquiry from ${safe(name)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background:#ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; margin: 0;">SehatKor</h1>
          <p style="color: #64748b; margin: 6px 0;">New Contact Submission</p>
        </div>
        <div style="background:#f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px;">
          <p style="margin:0 0 10px 0; color:#0f172a;"><strong>Name:</strong> ${safe(name)}</p>
          <p style="margin:0 0 10px 0; color:#0f172a;"><strong>Email:</strong> ${safe(email)}</p>
          ${phone ? `<p style=\"margin:0 0 10px 0; color:#0f172a;\"><strong>Phone:</strong> ${safe(phone)}</p>` : ""}
          ${category ? `<p style=\"margin:0 0 10px 0; color:#0f172a;\"><strong>Category:</strong> ${safe(category)}</p>` : ""}
          ${subject ? `<p style=\"margin:0 0 10px 0; color:#0f172a;\"><strong>Subject:</strong> ${safe(subject)}</p>` : ""}
          <div style="margin-top: 16px;">
            <p style="color:#0f172a; margin:0 0 8px 0;"><strong>Message:</strong></p>
            <div style="white-space: pre-wrap; color:#334155;">${safe(message)}</div>
          </div>
        </div>
        <p style="color:#64748b; font-size:12px; margin-top:16px;">This email was sent from the SehatKor contact form.</p>
      </div>
    `;

    const mailOptions = {
      from: `SehatKor Contact <${process.env.EMAIL_USER}>`,
      to: toAddress,
      replyTo: email,
      subject: title,
      html,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Contact email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    if (process.env.DEBUG_EMAIL === 'true') {
      console.log('Sending password reset email');
    }
    
    const mailOptions = {
      from: `"SehatKor Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - SehatKor',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">SehatKor</h1>
            <p style="color: #666; margin: 5px 0;">Healthcare Services Platform</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #475569; line-height: 1.6;">
              We received a request to reset your password for your SehatKor account. 
              If you made this request, please click the button below to reset your password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
              This link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              If you didn't request this password reset, please ignore this email. 
              Your password will remain unchanged.
            </p>
            <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};
