# 📧 Email Configuration Guide for Production

## Current Issue
Password reset emails are not being sent from your production server at `http://sehatkor.cloud/`

## Required .env Configuration

Add these variables to your `server/.env` file:

```env
# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sehatkor15@gmail.com
EMAIL_PASS=your_app_password_here
CONTACT_RECEIVER=sehatkor15@gmail.com

# Frontend URL (CRITICAL - Required for password reset links)
FRONTEND_URL=http://sehatkor.cloud

# Debug flags (Enable for troubleshooting)
DEBUG_EMAIL=true
DEBUG_PASSWORD_RESET=true
```

## 🔧 Steps to Fix Gmail SMTP

### Step 1: Generate a New Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Enable **2-Step Verification** if not already enabled
4. After enabling 2-Step Verification, go back to Security
5. Scroll down to "How you sign in to Google"
6. Click on **App passwords**
7. Select:
   - **App**: Mail
   - **Device**: Other (Custom name) - Type "SehatKor Production"
8. Click **Generate**
9. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
10. Remove spaces and use it as `EMAIL_PASS` in your `.env` file

### Step 2: Update Your .env File

```env
EMAIL_PASS=abcdefghijklmnop  # Your new app password (no spaces)
FRONTEND_URL=http://sehatkor.cloud  # MUST BE SET
DEBUG_EMAIL=true  # Enable for testing
DEBUG_PASSWORD_RESET=true  # Enable for testing
```

### Step 3: Restart Your Server

```bash
# Stop your current server
pm2 stop all  # or however you're running it

# Restart with new configuration
pm2 start server/index.js --name sehatkor
pm2 logs sehatkor  # Watch the logs
```

### Step 4: Test Password Reset

1. Go to: http://sehatkor.cloud/forgot-password
2. Enter a registered email address
3. Click "Send Reset Link"
4. Check the server logs for detailed debug information
5. Check the email inbox (including spam folder)

## 🐛 Debugging

With `DEBUG_EMAIL=true` and `DEBUG_PASSWORD_RESET=true`, you'll see detailed logs:

```
Forgot password: request received
Forgot password: looking up user
Forgot password: user found
Forgot password: saving user with reset token
Forgot password: attempting to send email
Initializing email transporter
EMAIL_HOST: smtp.gmail.com
EMAIL_PORT: 587
EMAIL_USER: sehatkor15@gmail.com
EMAIL_PASS: ***SET***
Sending password reset email
To: user@example.com
Reset URL: http://sehatkor.cloud/reset-password/abc123...
Email sent successfully
Message ID: <...>
```

## ❌ Common Errors and Solutions

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution**: Your app password is incorrect or expired. Generate a new one.

### Error: "ECONNREFUSED"
**Solution**: Your server cannot reach Gmail's SMTP server. Check firewall settings.

### Error: "ETIMEDOUT"
**Solution**: Port 587 might be blocked. Try using port 465 with `secure: true`.

### Error: "self signed certificate"
**Solution**: Already fixed with `tls: { rejectUnauthorized: false }`

### No error but email not received
**Solutions**:
1. Check spam/junk folder
2. Verify `FRONTEND_URL` is set correctly
3. Check Gmail's "Sent" folder to confirm email was sent
4. Try a different email provider (not Gmail) to test

## 🚀 Alternative: Use a Production Email Service

Gmail is not ideal for production. Consider these alternatives:

### Option 1: SendGrid (Recommended)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

### Option 2: Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your_mailgun_password
```

### Option 3: AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_aws_access_key
EMAIL_PASS=your_aws_secret_key
```

## 📝 What Was Changed in Code

### File: `server/config/email.js`

1. **Changed from `service: 'gmail'` to explicit SMTP configuration**
   - More reliable and works better in production
   - Added TLS configuration for self-signed certificates

2. **Added comprehensive debug logging**
   - Shows all email configuration details
   - Logs email sending progress
   - Shows detailed error information

3. **Added fallback for FRONTEND_URL**
   - Prevents undefined URLs in reset links

4. **Enhanced error handling**
   - Shows detailed error codes and responses
   - Helps identify the exact issue

## ✅ Verification Checklist

- [ ] 2-Step Verification enabled on Gmail account
- [ ] New App Password generated
- [ ] `EMAIL_PASS` updated in `.env` file
- [ ] `FRONTEND_URL=http://sehatkor.cloud` added to `.env`
- [ ] `DEBUG_EMAIL=true` enabled
- [ ] `DEBUG_PASSWORD_RESET=true` enabled
- [ ] Server restarted
- [ ] Tested forgot password flow
- [ ] Checked server logs
- [ ] Email received (check spam folder too)

## 🆘 Still Not Working?

If you've followed all steps and it's still not working:

1. **Share the server logs** - The debug output will show the exact error
2. **Try a different email** - Test with a non-Gmail address
3. **Check server firewall** - Ensure port 587 is open for outbound connections
4. **Switch to a production email service** - Gmail has strict limits

## Contact
If you need help, share:
- Server logs (with DEBUG_EMAIL=true)
- The exact error message
- Which step you're stuck on
