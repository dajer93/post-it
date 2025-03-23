const Message = require('../models/Message');

// @desc    Create a new message
// @route   POST /api/messages
// @access  Private
const createMessage = async (req, res) => {
  try {
    const { content, latitude, longitude } = req.body;

    if (!content || !latitude || !longitude) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const message = await Message.create({
      content,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude], // GeoJSON format is [longitude, latitude]
      },
      user: req.user._id,
      username: req.user.username,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get nearby messages (within 100m radius)
// @route   GET /api/messages/nearby
// @access  Private
const getNearbyMessages = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Please provide latitude and longitude' });
    }

    // Convert to numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Find messages within 100m radius
    const messages = await Message.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat], // GeoJSON format is [longitude, latitude]
          },
          $maxDistance: 100, // 100 meters in meters
        },
      },
    }).sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the user owns the message
    if (message.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await message.deleteOne();
    res.json({ message: 'Message removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createMessage,
  getNearbyMessages,
  deleteMessage,
}; 