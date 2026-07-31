const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth, requireAuthorOrAdmin } = require('../middleware/auth');

// Herkes okuyabilir
router.get('/', postController.listPosts);
router.get('/:slugOrId', postController.getPost);

// Sadece yazar/editör/admin oluşturabilir, güncelleyebilir, silebilir
router.post('/', requireAuth, requireAuthorOrAdmin, postController.createPost);
router.patch('/:id', requireAuth, requireAuthorOrAdmin, postController.updatePost);
router.delete('/:id', requireAuth, requireAuthorOrAdmin, postController.deletePost);

module.exports = router;
