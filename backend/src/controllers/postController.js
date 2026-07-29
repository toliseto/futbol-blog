// HTTP isteklerini karşılayıp modeli çağıran controller katmanı
const postModel = require('../models/postModel');

async function listPosts(req, res) {
  try {
    const posts = await postModel.getAllPosts();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Yazılar getirilirken bir hata oluştu.' });
  }
}

async function getPost(req, res) {
  try {
    const post = await postModel.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Yazı bulunamadı.' });
    }
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Yazı getirilirken bir hata oluştu.' });
  }
}

async function createPost(req, res) {
  try {
    const { title, content, author, image_url } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Başlık ve içerik zorunludur.' });
    }
    const newPost = await postModel.createPost({
      title,
      content,
      author: author || 'Editör',
      image_url: image_url || null,
    });
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Yazı oluşturulurken bir hata oluştu.' });
  }
}

async function updatePost(req, res) {
  try {
    const existing = await postModel.getPostById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Yazı bulunamadı.' });
    }
    const { title, content, author, image_url } = req.body;
    const updated = await postModel.updatePost(req.params.id, {
      title: title || existing.title,
      content: content || existing.content,
      author: author || existing.author,
      image_url: image_url || existing.image_url,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Yazı güncellenirken bir hata oluştu.' });
  }
}

async function deletePost(req, res) {
  try {
    const deleted = await postModel.deletePost(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Yazı bulunamadı.' });
    }
    res.json({ message: 'Yazı silindi.', post: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Yazı silinirken bir hata oluştu.' });
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
