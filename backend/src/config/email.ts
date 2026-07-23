import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

/**
 * Email Service Configuration
 * Handles transactional emails via SMTP
 */
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

const getEmailConfig = (): EmailConfig => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: process.env.EMAIL_FROM || 'noreply@shareplate.org',
});

const createTransporter = (): nodemailer.Transporter<SMTPTransport.SentMessageInfo> => {
  const config = getEmailConfig();
  return nodemailer.createTransporter({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

export const transporter = createTransporter();
export const emailFrom = getEmailConfig().from;
export default { transporter, emailFrom };
