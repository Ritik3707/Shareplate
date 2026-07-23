import Stripe from 'stripe';

/**
 * Stripe Configuration
 * Handles payment processing for NGO donations
 */
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
  typescript: true,
  appInfo: {
    name: 'SharePlate',
    version: '1.0.0',
  },
});

export default stripe;
