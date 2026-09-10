import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Email service configuration
const resend = (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'undefined')
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Nodemailer fallback configuration
const createNodemailerTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return null;
};

const transporter = createNodemailerTransporter();

// Email templates
const emailTemplates = {
  passwordReset: (data: any) => ({
    subject: `🔑 Reset your password - SkillSpace`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7AC2F9 0%, #6AB4ED 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔑 Reset Your Password</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.name},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            You requested to reset your password. Please click the button below to set a new password:
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.resetUrl}" style="background: #7AC2F9; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If the button above doesn't work, you can copy and paste the following link into your browser:<br>
            <a href="${data.resetUrl}" style="color: #7AC2F9; word-break: break-all;">${data.resetUrl}</a>
          </p>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          Best regards,<br>SkillSpace Team
        </div>
      </div>
    `
  }),

  emailVerification: (data: any) => ({
    subject: `🔐 Verify your email address - SkillSpace`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7AC2F9 0%, #6AB4ED 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Verify Your Email - SkillSpace</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.name},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for creating an account with SkillSpace! Please verify your email address to get full access to your account and start your learning journey.
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.verifyUrl}" style="background: #7AC2F9; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Verify Email Address
            </a>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If the button above doesn't work, you can copy and paste the following link into your browser:<br>
            <a href="${data.verifyUrl}" style="color: #7AC2F9; word-break: break-all;">${data.verifyUrl}</a>
          </p>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          Best regards,<br>SkillSpace Team
        </div>
      </div>
    `
  }),

  classReminder: (data: any) => ({
    subject: `📚 Class Reminder: ${data.className} in ${data.timeUntil}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7AC2F9 0%, #6AB4ED 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📚 Class Reminder</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Your class starts ${data.timeUntil}!</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #7AC2F9;">📖 ${data.className}</h3>
            <p><strong>📅 Date:</strong> ${data.date}</p>
            <p><strong>⏰ Time:</strong> ${data.time}</p>
            <p><strong>👨‍🏫 Instructor:</strong> ${data.instructorName}</p>
            <p><strong>📍 Subject:</strong> ${data.subject}</p>
          </div>

          ${data.zoomLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.zoomLink}" style="background: #7AC2F9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                🎥 Join Class
              </a>
            </div>
          ` : ''}

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Make sure you have a stable internet connection and your learning materials ready!
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          Best regards,<br>SkillSpace Team
        </div>
      </div>
    `
  }),

  bookingConfirmation: (data: any) => ({
    subject: `✅ Booking Confirmed: ${data.className}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Booking Confirmed!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Your tutoring session has been confirmed</h2>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h3 style="margin-top: 0; color: #22c55e;">📚 Session Details</h3>
            <p><strong>📖 Subject:</strong> ${data.subject}</p>
            <p><strong>📅 Date:</strong> ${data.date}</p>
            <p><strong>⏰ Time:</strong> ${data.time}</p>
            <p><strong>⏱️ Duration:</strong> ${data.duration} minutes</p>
            <p><strong>👨‍🏫 Tutor:</strong> ${data.tutorName}</p>
            <p><strong>💰 Total Cost:</strong> $${data.totalCost}</p>
          </div>

          ${data.zoomLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.zoomLink}" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                🎥 Join Session
              </a>
            </div>
          ` : ''}

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>📝 What to prepare:</strong><br>
              • Have your learning materials ready<br>
              • Ensure stable internet connection<br>
              • Test your audio/video before the session
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          Questions? Contact us at support@skillspace.education<br>
          SkillSpace Team
        </div>
      </div>
    `
  }),

  paymentSuccess: (data: any) => ({
    subject: `💳 Payment Successful - ${data.planName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💳 Payment Successful!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Thank you for your subscription!</h2>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #10b981;">📋 Subscription Details</h3>
            <p><strong>📦 Plan:</strong> ${data.planName}</p>
            <p><strong>💰 Amount:</strong> $${data.amount}</p>
            <p><strong>🔄 Billing:</strong> ${data.interval}</p>
            <p><strong>📅 Next Billing:</strong> ${data.nextBilling}</p>
            <p><strong>🆔 Invoice ID:</strong> ${data.invoiceId}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              🎯 Access Dashboard
            </a>
          </div>

          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>🎉 What you get:</strong><br>
              • Access to all premium courses<br>
              • 1:1 tutoring sessions<br>
              • Live group classes<br>
              • Recorded session library<br>
              • Priority support
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          Need help? Contact us at support@skillspace.education<br>
          SkillSpace Team
        </div>
      </div>
    `
  }),

  welcomeEmail: (data: any) => ({
    subject: `🎉 Welcome to SkillSpace, ${data.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7AC2F9 0%, #6AB4ED 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Welcome to SkillSpace!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.name}, welcome to SkillSpace!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            You've just joined thousands of learners who are transforming their skills and achieving their goals. 
            Here's how to get started:
          </p>

          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #7AC2F9;">🚀 Quick Start Guide</h3>
            
            <div style="margin: 20px 0;">
              <strong>1. Complete Your Profile</strong>
              <p style="margin: 5px 0; color: #666;">Add your interests and learning goals</p>
            </div>
            
            <div style="margin: 20px 0;">
              <strong>2. Explore Courses</strong>
              <p style="margin: 5px 0; color: #666;">Browse our ${data.courseCount || '50+'} available courses</p>
            </div>
            
            <div style="margin: 20px 0;">
              <strong>3. Book Your First Session</strong>
              <p style="margin: 5px 0; color: #666;">Schedule 1:1 tutoring or join live classes</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #7AC2F9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">
              🎯 Go to Dashboard
            </a>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses" style="background: white; color: #7AC2F9; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; border: 2px solid #7AC2F9; margin: 10px;">
              📚 Browse Courses
            </a>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #92400e;">💡 Pro Tips for Success:</h4>
            <ul style="margin: 0; color: #92400e;">
              <li>Set specific learning goals for each month</li>
              <li>Schedule regular study sessions</li>
              <li>Join our community discussions</li>
              <li>Don't hesitate to ask questions!</li>
            </ul>
          </div>

          <p style="margin-top: 30px; color: #666;">
            If you have any questions, our support team is here to help. Just reply to this email or visit our help center.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Happy Learning! 🌟<br>
            The SkillSpace Team
          </p>
          <p style="margin: 10px 0 0 0; color: #888; font-size: 12px;">
            Follow us: 
            <a href="#" style="color: #7AC2F9; text-decoration: none;">Facebook</a> | 
            <a href="#" style="color: #7AC2F9; text-decoration: none;">Twitter</a> | 
            <a href="#" style="color: #7AC2F9; text-decoration: none;">LinkedIn</a>
          </p>
        </div>
      </div>
    `
  }),

  newMessage: (data: any) => ({
    subject: `💬 New message from ${data.senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7AC2F9 0%, #6AB4ED 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💬 New Message</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.receiverName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            <strong>${data.senderName}</strong> sent you a message:
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7AC2F9;">
            <p style="margin: 0; color: #333; font-style: italic;">${data.messagePreview}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.conversationUrl}" style="background: #7AC2F9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              📨 View Message
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          Best regards,<br>SkillSpace Team
        </div>
      </div>
    `
  }),

  meetingCancelled: (data: any) => ({
    subject: `❌ Progress Meeting Cancelled - ${data.scheduledDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">❌ Meeting Cancelled</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.recipientType === 'parent' ? data.parentName : data.tutorName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Your progress meeting has been cancelled by <strong>${data.cancelledByName}</strong> (${data.cancelledBy}).
          </p>

          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="margin-top: 0; color: #dc2626;">Cancelled Meeting Details</h3>
            <p><strong>📅 Date:</strong> ${data.scheduledDate}</p>
            <p><strong>⏰ Time:</strong> ${data.scheduledTime}</p>
            <p><strong>👨‍🏫 Tutor:</strong> ${data.tutorName}</p>
            <p><strong>👨‍👩‍👧 Parent:</strong> ${data.parentName}</p>
            <p><strong>👤 Student:</strong> ${data.studentName}</p>
            <p><strong>📋 Type:</strong> ${data.meetingType.replace('_', ' ')}</p>
          </div>

          ${data.recipientType === 'parent' ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/parent/meetings" style="background: #7AC2F9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                📅 Schedule New Meeting
              </a>
            </div>
          ` : ''}

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have any questions, please don't hesitate to contact us.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          Best regards,<br>SkillSpace Team
        </div>
      </div>
    `
  })
};

// Email sending service
export class EmailService {
  // Send email using Resend (preferred)
  private static async sendWithResend(to: string, subject: string, html: string) {
    if (!resend) {
      throw new Error('Resend is not configured (missing RESEND_API_KEY)');
    }
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'SkillSpace <noreply@skillspace.education>',
        to: [to],
        subject,
        html,
      });

      if (error) {
        throw new Error(`Resend error: ${error.message}`);
      }

      return { success: true, messageId: data?.id };
    } catch (error: any) {
      console.error('Resend email error:', error);
      throw error;
    }
  }

  // Send email using Nodemailer (fallback)
  private static async sendWithNodemailer(to: string, subject: string, html: string) {
    if (!transporter) {
      throw new Error('SMTP not configured');
    }

    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'SkillSpace <noreply@skillspace.education>',
        to,
        subject,
        html,
      });

      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('Nodemailer error:', error);
      throw error;
    }
  }

  // Main send email method
  public static async sendEmail(to: string, template: keyof typeof emailTemplates, data: any) {
    try {
      const emailTemplate = emailTemplates[template](data);
      const { subject, html } = emailTemplate;

      // Try Resend first, fallback to Nodemailer
      try {
        return await this.sendWithResend(to, subject, html);
      } catch (resendError) {
        console.warn('Resend failed, trying Nodemailer:', resendError);

        if (transporter) {
          return await this.sendWithNodemailer(to, subject, html);
        } else {
          throw new Error('No email service configured');
        }
      }
    } catch (error: any) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Bulk email sending
  public static async sendBulkEmails(emails: Array<{ to: string, template: keyof typeof emailTemplates, data: any }>) {
    const results = [];

    for (const email of emails) {
      try {
        const result = await this.sendEmail(email.to, email.template, email.data);
        results.push({ ...email, success: true, result });
      } catch (error: any) {
        results.push({ ...email, success: false, error: error.message });
      }
    }

    return results;
  }

  // Send class reminder email
  public static async sendClassReminder(studentEmail: string, classData: any) {
    return this.sendEmail(studentEmail, 'classReminder', classData);
  }

  // Send booking confirmation email
  public static async sendBookingConfirmation(studentEmail: string, bookingData: any) {
    return this.sendEmail(studentEmail, 'bookingConfirmation', bookingData);
  }

  // Send payment success email
  public static async sendPaymentSuccess(customerEmail: string, paymentData: any) {
    return this.sendEmail(customerEmail, 'paymentSuccess', paymentData);
  }

  // Send welcome email
  public static async sendWelcomeEmail(userEmail: string, userData: any) {
    return this.sendEmail(userEmail, 'welcomeEmail', userData);
  }

  // Send verification email
  public static async sendVerificationEmail(userEmail: string, data: { name: string; verifyUrl: string }) {
    return this.sendEmail(userEmail, 'emailVerification', data);
  }

  // Send password reset email
  public static async sendPasswordResetEmail(userEmail: string, data: { name: string; resetUrl: string }) {
    return this.sendEmail(userEmail, 'passwordReset', data);
  }

  // Generic send email with custom subject and HTML
  public static async sendCustomEmail(to: string, subject: string, html: string) {
    if (!transporter) {
      console.error('Email transporter not configured. Please set SMTP environment variables.');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'SkillSpace <noreply@skillspace.education>',
        to,
        subject,
        html,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending custom email:', error);
      return { success: false, error };
    }
  }
}