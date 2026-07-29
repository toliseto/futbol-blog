// /api/posts altındaki tüm endpoint tanımları
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.listPosts);
router.get('/:id', postController.getPost);
router.post('/', postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;
