export const APP_NAME = 'SharePlate';
export const APP_VERSION = '1.0.0';
export const API_PREFIX = '/api/v1';

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// Time constants (in milliseconds)
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

// JWT
export const JWT_ACCESS_EXPIRY = '15m';
export const JWT_REFRESH_EXPIRY = '7d';
export const JWT_ACCESS_EXPIRY_MS = 15 * MS_PER_MINUTE;
export const JWT_REFRESH_EXPIRY_MS = 7 * MS_PER_DAY;

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 15 * MS_PER_MINUTE;
export const RATE_LIMIT_MAX = 100;
export const AUTH_RATE_LIMIT_MAX = 5;

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGES_PER_DONATION = 5;

// Distance
export const DEFAULT_SEARCH_RADIUS_KM = 10;
export const MAX_SEARCH_RADIUS_KM = 50;

// Priority scoring weights
export const PRIORITY_WEIGHTS = {
  URGENCY: 30,
  FRESHNESS: 25,
  SERVINGS: 20,
  DISTANCE: 15,
  TIME_REMAINING: 10,
};

// Food freshness thresholds (hours)
export const FRESHNESS_THRESHOLDS = {
  EXCELLENT: 2,
  GOOD: 4,
  FAIR: 6,
  POOR: 8,
};

// NGO verification
export const NGO_VERIFICATION_DOCUMENTS = [
  'registration_certificate',
  'tax_exemption_certificate',
  'bank_statement',
  'address_proof',
  'id_proof',
];

// Cache keys
export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  DONATION: (id: string) => `donation:${id}`,
  DONATIONS_LIST: (hash: string) => `donations:list:${hash}`,
  LEADERBOARD: (period: string) => `leaderboard:${period}`,
  NEARBY_DONATIONS: (lat: number, lng: number) => `donations:nearby:${lat}:${lng}`,
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  RATE_LIMIT: (key: string) => `ratelimit:${key}`,
} as const;

// Cache TTL (seconds)
export const CACHE_TTL = {
  USER: 3600,
  DONATION: 1800,
  DONATIONS_LIST: 300,
  LEADERBOARD: 600,
  NEARBY_DONATIONS: 120,
  NOTIFICATIONS: 60,
};

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access. Please login.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  INTERNAL_ERROR: 'An internal server error occurred.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  INVALID_TOKEN: 'Invalid or expired token.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  DONATION_NOT_FOUND: 'Donation not found.',
  DONATION_EXPIRED: 'This donation has expired.',
  NGO_NOT_VERIFIED: 'NGO is not verified.',
  VOLUNTEER_NOT_AVAILABLE: 'Volunteer is not available.',
  PICKUP_ALREADY_ASSIGNED: 'Pickup is already assigned to another volunteer.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  REGISTERED: 'Account created successfully. Please verify your email.',
  LOGGED_IN: 'Logged in successfully.',
  LOGGED_OUT: 'Logged out successfully.',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email.',
  PASSWORD_RESET: 'Password reset successfully.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  PHONE_VERIFIED: 'Phone verified successfully.',
  DONATION_CREATED: 'Donation created successfully.',
  DONATION_UPDATED: 'Donation updated successfully.',
  DONATION_ACCEPTED: 'Donation accepted successfully.',
  DONATION_CANCELLED: 'Donation cancelled successfully.',
  PICKUP_ACCEPTED: 'Pickup request accepted successfully.',
  DELIVERY_COMPLETED: 'Delivery completed successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  NGO_VERIFIED: 'NGO verified successfully.',
  PAYMENT_SUCCESS: 'Payment processed successfully.',
} as const;
