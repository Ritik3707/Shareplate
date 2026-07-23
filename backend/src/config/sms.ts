import twilio from 'twilio';
import logger from './logger';
import type { SmsOptions } from '../types';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (options: SmsOptions): Promise<void> => {
  try {
    await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: options.to,
    });
    logger.info(`SMS sent to ${options.to}`);
  } catch (error) {
    logger.error('SMS send error:', error);
    throw new Error('Failed to send SMS');
  }
};

export const sendOTP = async (phone: string, otp: string): Promise<void> => {
  await sendSMS({
    to: phone,
    message: `Your SharePlate verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
  });
};

export const sendDonationSMS = async (phone: string, message: string): Promise<void> => {
  await sendSMS({
    to: phone,
    message: `SharePlate: ${message}`,
  });
};

export default client;
