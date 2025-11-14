// Email configuration using DirectAdmin SMTP
// Only load .env in development (Coolify provides env vars in production)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
}
const nodemailer = require('nodemailer');

// Create SMTP transporter using DirectAdmin email server
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.starkey.digital',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.SMTP_USER || 'auth@starkey.digital',
        pass: process.env.SMTP_PASSWORD || 'wjff1960' // MUST be set via environment in production
    },
    tls: {
        rejectUnauthorized: false // For self-signed certificates if needed
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ Email server connection error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

/**
 * Send email verification
 */
async function sendVerificationEmail(email, name, token) {
    const verificationUrl = `${process.env.BETTER_AUTH_URL}/verify-email.html?token=${token}`;

    const mailOptions = {
        from: '"Better Auth" <auth@starkey.digital>',
        to: email,
        subject: 'Verify Your Email Address',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        line-height: 1.6;
                        color: #1e293b;
                        background: #f8fafc;
                        padding: 40px 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    }
                    .header {
                        background: #667eea;
                        color: white;
                        padding: 48px 32px;
                        text-align: center;
                    }
                    .header-icon {
                        font-size: 48px;
                        margin-bottom: 16px;
                    }
                    .header h1 {
                        font-size: 28px;
                        font-weight: 700;
                        margin: 0;
                        letter-spacing: -0.5px;
                    }
                    .content {
                        padding: 40px 32px;
                    }
                    .greeting {
                        font-size: 18px;
                        font-weight: 600;
                        color: #0f172a;
                        margin-bottom: 16px;
                    }
                    .text {
                        font-size: 15px;
                        color: #475569;
                        margin-bottom: 24px;
                    }
                    .button-container {
                        text-align: center;
                        margin: 32px 0;
                    }
                    .button {
                        display: inline-block;
                        padding: 16px 40px;
                        background: #667eea;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                        transition: all 0.3s ease;
                    }
                    .divider {
                        margin: 32px 0;
                        text-align: center;
                        color: #94a3b8;
                        font-size: 13px;
                    }
                    .link-box {
                        background: #f1f5f9;
                        padding: 16px;
                        border-radius: 8px;
                        word-break: break-all;
                        font-size: 13px;
                        color: #667eea;
                        border: 1px solid #e2e8f0;
                    }
                    .info-box {
                        background: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 16px;
                        border-radius: 8px;
                        margin: 24px 0;
                    }
                    .info-box p {
                        margin: 0;
                        font-size: 14px;
                        color: #78350f;
                    }
                    .footer {
                        background: #f8fafc;
                        padding: 24px 32px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                    }
                    .footer p {
                        margin: 4px 0;
                        color: #64748b;
                        font-size: 13px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="header-icon">✉️</div>
                        <h1>Verify Your Email</h1>
                    </div>
                    <div class="content">
                        <p class="greeting">Hi ${name},</p>
                        <p class="text">Welcome to Better Auth! We're excited to have you on board.</p>
                        <p class="text">To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
                        
                        <div class="button-container">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </div>
                        
                        <div class="divider">Or copy and paste this link</div>
                        
                        <div class="link-box">${verificationUrl}</div>
                        
                        <div class="info-box">
                            <p><strong>⏱ Expires in 24 hours</strong> • If you didn't create an account, you can safely ignore this email.</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p><strong>Better Auth</strong></p>
                        <p>© ${new Date().getFullYear()} Better Auth. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return await transporter.sendMail(mailOptions);
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${process.env.BETTER_AUTH_URL}/reset-password.html?token=${token}`;

    const mailOptions = {
        from: '"Better Auth" <auth@starkey.digital>',
        to: email,
        subject: 'Reset Your Password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f5f7; line-height: 1.6;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                                
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 48px 40px; text-align: center; background-color: #0f172a;">
                                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">Reset Your Password</h1>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px;">
                                        <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Hi ${name},</p>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
                                        
                                        <!-- Button -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                                            <tr>
                                                <td align="center">
                                                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 48px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">Reset Password</a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="margin: 32px 0 16px 0; font-size: 13px; color: #94a3b8; text-align: center;">Or copy and paste this link into your browser:</p>
                                        
                                        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                            <p style="margin: 0; font-size: 13px; color: #2563eb; word-break: break-all;">${resetUrl}</p>
                                        </div>
                                        
                                        <!-- Info Box -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 0 0;">
                                            <tr>
                                                <td style="background-color: #f1f5f9; border-left: 4px solid #64748b; padding: 16px; border-radius: 8px;">
                                                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #334155;">Security Info</p>
                                                    <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">This link expires in 1 hour. If you didn't request this reset, you can safely ignore this email.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #0f172a;">Better Auth</p>
                                        <p style="margin: 0; font-size: 13px; color: #94a3b8;">Secure authentication for your application</p>
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `
    };

    return await transporter.sendMail(mailOptions);
}

/**
 * Send password change confirmation email
 */
async function sendPasswordChangedEmail(email, name) {
    const mailOptions = {
        from: '"Better Auth" <auth@starkey.digital>',
        to: email,
        subject: 'Password Changed Successfully',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        line-height: 1.6;
                        color: #1e293b;
                        background: #f8fafc;
                        padding: 40px 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    }
                    .header {
                        background: #10b981;
                        color: white;
                        padding: 48px 32px;
                        text-align: center;
                    }
                    .header-icon {
                        font-size: 48px;
                        margin-bottom: 16px;
                    }
                    .header h1 {
                        font-size: 28px;
                        font-weight: 700;
                        margin: 0;
                        letter-spacing: -0.5px;
                    }
                    .content {
                        padding: 40px 32px;
                    }
                    .greeting {
                        font-size: 18px;
                        font-weight: 600;
                        color: #0f172a;
                        margin-bottom: 16px;
                    }
                    .text {
                        font-size: 15px;
                        color: #475569;
                        margin-bottom: 24px;
                    }
                    .success-box {
                        background: #d1fae5;
                        border-left: 4px solid #10b981;
                        padding: 16px;
                        border-radius: 8px;
                        margin: 24px 0;
                    }
                    .success-box p {
                        margin: 0;
                        font-size: 15px;
                        color: #065f46;
                        font-weight: 500;
                    }
                    .warning-box {
                        background: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 16px;
                        border-radius: 8px;
                        margin: 24px 0;
                    }
                    .warning-box p {
                        margin: 0;
                        font-size: 14px;
                        color: #78350f;
                    }
                    .warning-box strong {
                        color: #92400e;
                        display: block;
                        margin-bottom: 4px;
                    }
                    .info-row {
                        background: #f1f5f9;
                        padding: 12px 16px;
                        border-radius: 8px;
                        margin: 16px 0;
                        font-size: 14px;
                        color: #64748b;
                    }
                    .footer {
                        background: #f8fafc;
                        padding: 24px 32px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                    }
                    .footer p {
                        margin: 4px 0;
                        color: #64748b;
                        font-size: 13px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="header-icon">✓</div>
                        <h1>Password Changed</h1>
                    </div>
                    <div class="content">
                        <p class="greeting">Hi ${name},</p>
                        
                        <div class="success-box">
                            <p>✓ Your password has been successfully changed.</p>
                        </div>
                        
                        <p class="text">If you made this change, no further action is needed. You can now use your new password to sign in to your account.</p>
                        
                        <div class="info-row">
                            <strong>Changed on:</strong> ${new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}
                        </div>
                        
                        <div class="warning-box">
                            <p><strong>⚠️ Didn't make this change?</strong></p>
                            <p>If you did not change your password, please contact support immediately as your account may be compromised.</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p><strong>Better Auth</strong></p>
                        <p>© ${new Date().getFullYear()} Better Auth. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return await transporter.sendMail(mailOptions);
}

module.exports = {
    transporter,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendPasswordChangedEmail
};
