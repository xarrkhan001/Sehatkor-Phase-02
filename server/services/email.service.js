// services/email.service.js - SendGrid Version
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send verification email to provider when approved by admin
 * @param {string} userEmail - Provider's email address
 * @param {string} userName - Provider's name
 * @param {string} userRole - Provider's role (doctor, pharmacy, laboratory, clinic/hospital)
 */
export const sendProviderVerificationEmail = async (userEmail, userName, userRole) => {
  try {
    // Get role-specific content
    const roleLabel = getRoleLabel(userRole);
    const roleEmoji = getRoleEmoji(userRole);
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://sehatkor.pk';
    const loginUrl = `${frontendUrl}/login`;
    const fromEmail = process.env.EMAIL_FROM || 'sehatkor15@gmail.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'SehatKor - صحت کور';

    const mailOptions = {
      to: userEmail,
      from: {
        email: fromEmail,
        name: fromName
      },
      subject: `🎉 Welcome to SehatKor! Your ${roleLabel} Account is Verified`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Verified - SehatKor</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header with gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        ${roleEmoji} مبارک ہو!
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 16px; font-weight: 500;">
                        Congratulations!
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 24px; font-weight: 600;">
                        Dear ${userName},
                      </h2>
                      
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Great news! Your <strong>${roleLabel}</strong> account has been successfully verified by our admin team. 
                        You can now access all features of the SehatKor platform.
                      </p>

                      <div style="background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%); border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 8px;">
                        <p style="margin: 0; color: #4c1d95; font-size: 15px; line-height: 1.6;">
                          <strong>✨ What's Next?</strong><br>
                          You can now sign in to your account and start adding your services to help patients find and connect with you.
                        </p>
                      </div>

                      <p style="margin: 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        <strong>Here's what you can do now:</strong>
                      </p>

                      <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #4a5568; font-size: 15px; line-height: 1.8;">
                        <li>Sign in to your SehatKor account</li>
                        <li>Complete your professional profile</li>
                        <li>Add your services and specialties</li>
                        <li>Set your availability and pricing</li>
                        <li>Start receiving appointment bookings</li>
                        <li>Connect with patients across Pakistan</li>
                      </ul>

                      <!-- CTA Button -->
                      <table role="presentation" style="margin: 30px 0;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                              🚀 Sign In & Add Services
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 25px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${loginUrl}" style="color: #667eea; text-decoration: none; word-break: break-all;">${loginUrl}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Support Section -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 15px 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
                        <strong>Need Help?</strong><br>
                        If you have any questions or need assistance setting up your profile, our support team is here to help.
                      </p>
                      <p style="margin: 0; color: #718096; font-size: 13px;">
                        📧 Email: support@sehatkor.com<br>
                        🌐 Website: <a href="${frontendUrl}" style="color: #667eea; text-decoration: none;">${frontendUrl}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #1a202c; padding: 25px 30px; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #a0aec0; font-size: 14px; font-weight: 600;">
                        SehatKor - صحت کور
                      </p>
                      <p style="margin: 0; color: #718096; font-size: 12px; line-height: 1.5;">
                        Pakistan's Leading Healthcare Platform<br>
                        Connecting Patients with Quality Healthcare Providers
                      </p>
                      <p style="margin: 15px 0 0 0; color: #4a5568; font-size: 11px;">
                        © ${new Date().getFullYear()} SehatKor. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Dear ${userName},

Congratulations! Your ${roleLabel} account has been successfully verified by our admin team.

You can now sign in to your SehatKor account and start adding your services to help patients find and connect with you.

What's Next?
- Sign in to your account at: ${loginUrl}
- Complete your professional profile
- Add your services and specialties
- Set your availability and pricing
- Start receiving appointment bookings

Need help? Contact us at support@sehatkor.com

Best regards,
SehatKor Team
${frontendUrl}
      `.trim()
    };

    await sgMail.send(mailOptions);
    
    console.log('✅ Verification email sent successfully to:', userEmail);
    console.log('📧 Sent via SendGrid');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    console.error('📧 Failed recipient:', userEmail);
    
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
    
    // Log but don't throw - email failure shouldn't block verification
    return { success: false, error: error.message };
  }
};

/**
 * Get user-friendly role label
 */
const getRoleLabel = (role) => {
  const labels = {
    'doctor': 'Doctor',
    'pharmacy': 'Pharmacy',
    'laboratory': 'Laboratory',
    'clinic/hospital': 'Clinic/Hospital'
  };
  return labels[role] || 'Provider';
};

/**
 * Get role-specific emoji
 */
const getRoleEmoji = (role) => {
  const emojis = {
    'doctor': '👨‍⚕️',
    'pharmacy': '💊',
    'laboratory': '🔬',
    'clinic/hospital': '🏥'
  };
  return emojis[role] || '✅';
};

export default {
  sendProviderVerificationEmail
};
