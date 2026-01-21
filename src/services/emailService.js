// src/services/emailService.js
import nodemailer from "nodemailer";

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // 👈 THIS FIXES THE ERROR
    },
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    from: {
      name: "Second Brain",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "Password Reset Request - Second Brain",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .link-box {
              background: white;
              padding: 15px;
              border-radius: 5px;
              border: 1px solid #ddd;
              word-break: break-all;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧠 Second Brain</h1>
              <p style="margin: 10px 0 0 0;">Password Reset Request</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy this link:</p>
              <div class="link-box">
                <a href="${resetLink}" style="color: #667eea;">${resetLink}</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>This link expires in <strong>10 minutes</strong></li>
                  <li>If you didn't request this, ignore this email</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The Second Brain Team</strong></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Password Reset - Second Brain\n\nClick this link: ${resetLink}\n\nExpires in 10 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email failed:", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: {
      name: "Second Brain",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "Welcome to Second Brain! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
              <h1>🧠 Welcome to Second Brain!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 10px;">
              <p>Hi <strong>${name}</strong>,</p>
              <p>Thank you for joining Second Brain!</p>
              <p>Get started organizing your knowledge today.</p>
              <p>Best regards,<br><strong>The Second Brain Team</strong></p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent to:", email);
  } catch (error) {
    console.error("❌ Welcome email failed:", error);
  }
};

/**
 * Test email connection
 */
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email service ready");
    return true;
  } catch (error) {
    console.error("❌ Email config error:", error);
    return false;
  }
};
