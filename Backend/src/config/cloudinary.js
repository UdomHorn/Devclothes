const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage engine for Multer (Products)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devclothes_ecommerce_products', // The folder inside Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    // Optional image optimizations on upload
    transformation: [{ width: 1000, height: 1500, crop: 'limit' }],
    // Pre-generate common thumbnail and responsive card sizes
    eager: [
      { width: 300, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      { width: 500, height: 667, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      { width: 800, height: 1067, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      { width: 100, height: 133, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
    ]
  },
});

// Dedicated storage engine for Banners to preserve quality but limit excessive resolution/size
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devclothes_ecommerce_banners', // Separate folder inside Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    // Limit to max 1920 width to prevent massive files
    transformation: [{ width: 1920, height: 1080, crop: 'limit' }],
    // Pre-generate sizes used by home and collection banners
    eager: [
      { width: 600, height: 600, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      { width: 1200, height: 675, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      { width: 1600, height: 900, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
    ]
  },
});

const upload = multer({ storage: storage });
const uploadBanner = multer({ storage: bannerStorage });

module.exports = {
  cloudinary,
  upload,
  uploadBanner
};
