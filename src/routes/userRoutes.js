const express = require('express');
const { registerUser, loginUser, getUser, followUser, unfollowUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/:id', protect, getUser);

router.post('/:id/follow', protect, followUser); 
router.post('/:id/unfollow', protect, unfollowUser); 

module.exports = router;
