// Yazılarla (posts) ilgili tüm veritabanı sorguları burada toplanır
const pool = require('../config/db');

// Tüm yazıları en yeniden en eskiye getir
async function getAllPosts() {
  const result = await pool.query(
    'SELECT * FROM posts ORDER BY created_at DESC'
  );
  return result.rows;
}

// Tek bir yazıyı id ile getir
async function getPostById(id) {
  const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
  return result.rows[0];
}

// Yeni yazı oluştur
async function createPost({ title, content, author, image_url, user_id }) {
  const result = await pool.query(
    `INSERT INTO posts (title, content, author, image_url, user_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, content, author, image_url, user_id]
  );
  return result.rows[0];
}

// Var olan yazıyı güncelle
async function updatePost(id, { title, content, author, image_url }) {
  const result = await pool.query(
    `UPDATE posts
     SET title = $1, content = $2, author = $3, image_url = $4
     WHERE id = $5 RETURNING *`,
    [title, content, author, image_url, id]
  );
  return result.rows[0];
}

// Yazıyı sil
async function deletePost(id) {
  const result = await pool.query(
    'DELETE FROM posts WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
