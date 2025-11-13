// Email configuration using DirectAdmin SMTP
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

// Create SMTP transporter using DirectAdmin email server
const transporter = nodemailer.createTransport({
    host: 'mail.starkey.digital',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: 'auth@starkey.digital',
        pass: 'wjff1960'
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
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Better Auth!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${name},</p>
                        <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
                        <p style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                        <p>This link will expire in 24 hours.</p>
                        <p>If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Better Auth. All rights reserved.</p>
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
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${name},</p>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <p style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2025 Better Auth. All rights reserved.</p>
                    </div>
                </div>
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
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success { background: #d4edda; border-left: 4px solid #28a745; padding: 10px; margin: 15px 0; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Password Changed</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${name},</p>
                        <div class="success">
                            Your password has been successfully changed.
                        </div>
                        <p>If you made this change, no further action is needed.</p>
                        <div class="warning">
                            <strong>⚠️ Didn't make this change?</strong><br>
                            If you did not change your password, please contact support immediately as your account may be compromised.
                        </div>
                        <p>Changed on: ${new Date().toLocaleString()}</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Better Auth. All rights reserved.</p>
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
