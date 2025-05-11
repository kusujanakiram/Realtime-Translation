const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // your cloudinary config


// Cloudinary storage configuration for audio files
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'anuvadham-audios',
    resource_type: 'raw', // for .wav, .mp3, etc.
    allowed_formats: ['wav', 'mp3'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Cloudinary storage configuration for profile pictures
const profilePicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'anuvadham-profile-pics',  // Folder for profile pictures
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => `profile-pic-${Date.now()}`, // Ensure unique name
  },
});

// Create separate uploaders for different use cases
const audioUploader = multer({ storage: audioStorage });
const profilePicUploader = multer({ storage: profilePicStorage });

module.exports = {
  audioUploader,
  profilePicUploader,
};
