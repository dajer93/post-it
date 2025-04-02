const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadProfileImage
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Register and login routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Profile routes - protected
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Profile picture upload route
router.post(
  '/profile/picture',
  protect,
  upload.single('profilePicture'),
  uploadProfileImage
);

module.exports = router; 