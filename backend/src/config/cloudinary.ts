import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Configuration
 * Handles image upload, transformation, and delivery
 */
const configureCloudinary = (): void => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
    secure: true,
  });
};

configureCloudinary();

export { cloudinary };
export default cloudinary;
