const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); 

const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'anuvadham-audios',
    resource_type: 'raw', // for .wav, .mp3, etc.
    allowed_formats: ['wav', 'mp3'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const profilePicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'anuvadham-profile-pics',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => `profile-pic-${Date.now()}`, 
  },
});

const audioUploader = multer({ storage: audioStorage });
const profilePicUploader = multer({ storage: profilePicStorage });

module.exports = {
  audioUploader,
  profilePicUploader,
};
