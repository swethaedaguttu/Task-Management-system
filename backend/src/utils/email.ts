import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
    // For Gmail, use OAuth2 or App Password
    // If using App Password, ensure "Less secure app access" is enabled or use OAuth2
  });
};

// Welcome email template
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    // Only send email if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP not configured. Skipping welcome email.');
      return;
    }

    const transporter = createTransporter();

    // Verify connection before sending
    await transporter.verify().catch((error) => {
      console.warn('SMTP connection verification failed:', error.message);
      // Continue anyway - sometimes verification fails but sending works
    });

    const mailOptions = {
      from: `"TaskFlow Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to TaskFlow! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to TaskFlow</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to TaskFlow! 🎉</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">
              Hi <strong>${name}</strong>,
            </p>
            
            <p style="color: #4b5563; margin-bottom: 20px;">
              Thank you for joining TaskFlow! We're excited to have you on board. TaskFlow is your personal productivity suite designed to help you manage and organize your tasks efficiently.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h2 style="color: #1f2937; margin-top: 0;">Getting Started:</h2>
              <ul style="color: #4b5563; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Create your first task by clicking the "New Task" button</li>
                <li style="margin-bottom: 10px;">Organize tasks by status: Pending, In Progress, or Completed</li>
                <li style="margin-bottom: 10px;">Use the search and filter features to find tasks quickly</li>
                <li style="margin-bottom: 10px;">Track your productivity with the dashboard statistics</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              If you have any questions or need help, feel free to reach out to our support team.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
              Happy task managing!<br>
              <strong>The TaskFlow Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to TaskFlow! 🎉

Hi ${name},

Thank you for joining TaskFlow! We're excited to have you on board. TaskFlow is your personal productivity suite designed to help you manage and organize your tasks efficiently.

Getting Started:
- Create your first task by clicking the "New Task" button
- Organize tasks by status: Pending, In Progress, or Completed
- Use the search and filter features to find tasks quickly
- Track your productivity with the dashboard statistics

Visit your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard

If you have any questions or need help, feel free to reach out to our support team.

Happy task managing!
The TaskFlow Team
      `,
    };

    // Send email with timeout
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email send timeout')), 15000); // 15 second timeout
    });

    await Promise.race([sendPromise, timeoutPromise]);
    console.log(`Welcome email sent to ${email}`);
  } catch (error: any) {
    // Log error but don't throw - email failure shouldn't break registration
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      console.warn(`Email send timeout for ${email}. This is non-critical and registration will continue.`);
    } else {
      console.error('Error sending welcome email:', error.message || error);
    }
    // Don't throw error - email failure shouldn't break registration
  }
};

