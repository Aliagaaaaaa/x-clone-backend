const express = require('express');
const {
  createPost,
  likePost,
  retweetPost,
  replyPost
} = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/retweet', protect, retweetPost);
router.post('/:id/reply', protect, replyPost);

module.exports = router;
