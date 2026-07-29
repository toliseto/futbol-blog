// /api/posts altındaki tüm endpoint tanımları
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', postController.listPosts);
router.get('/:id', postController.getPost);
router.post('/', requireAuth, postController.createPost);
router.put('/:id', requireAuth, postController.updatePost); // Sadece giriş yapan
router.delete('/:id', requireAuth, requireAdmin, postController.deletePost); // Sadece admin

module.exports = router;
