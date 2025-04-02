const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { uploadProfilePicture, deleteProfilePicture } = require('../utils/s3Utils');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(req.body);

    // Check if user exists
    const userExists = await User.findByUsername(username);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      password,
    });

    if (user) {
      res.status(201).json({
        userId: user.userId,
        username: user.username,
        profilePicture: user.profilePicture,
        token: generateToken(user.userId),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check for user
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await User.matchPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      userId: user.userId,
      username: user.username,
      profilePicture: user.profilePicture,
      token: generateToken(user.userId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      res.json({
        userId: user.userId,
        username: user.username,
        profilePicture: user.profilePicture,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      const updateData = {
        username: req.body.username || user.username,
        profilePicture: req.body.profilePicture || user.profilePicture,
      };

      // If password is provided, hash it
      if (req.body.password) {
        updateData.password = await User.hashPassword(req.body.password);
      }

      const updatedUser = await User.update(user.userId, updateData);

      res.json({
        userId: updatedUser.userId,
        username: updatedUser.username,
        profilePicture: updatedUser.profilePicture,
        token: generateToken(updatedUser.userId),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile/picture
// @access  Private
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the old profile picture if it exists
    if (user.profilePicture) {
      await deleteProfilePicture(user.profilePicture);
    }

    // Upload the new profile picture
    const fileBuffer = req.file.buffer;
    const contentType = req.file.mimetype;
    const profilePictureUrl = await uploadProfilePicture(fileBuffer, user.userId, contentType);

    // Update the user's profile picture
    const updatedUser = await User.update(user.userId, { profilePicture: profilePictureUrl });

    res.json({
      userId: updatedUser.userId,
      username: updatedUser.username,
      profilePicture: updatedUser.profilePicture,
      message: 'Profile picture updated successfully'
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadProfileImage
}; 