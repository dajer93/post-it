const express = require('express');
const router = express.Router();
const {
  createMessage,
  getNearbyMessages,
  deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All message routes are protected
router.use(protect);

// Message routes
router.route('/')
  .post(createMessage);

router.get('/nearby', getNearbyMessages);

router.route('/:id')
  .delete(deleteMessage);

module.exports = router; 