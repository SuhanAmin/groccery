const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // from your .env
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'groccery',              // optional: folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],  // allowed file types
    transformation: [{ width: 800, height: 600, crop: 'limit' }], // optional
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
