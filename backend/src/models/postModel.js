const pool = require('../config/db');

async function getAllPosts(limit = 10, offset = 0, categorySlug = null, search = null) {
  let query = `
    SELECT p.id, p.title, p.slug, p.summary, p.image_url, p.views, p.created_at, p.status, 
           COALESCE(u.username, 'ESPN Bot') as author, c.name as category_name, c.slug as category_slug
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'published'
  `;
  const params = [];
  let paramCount = 1;

  if (categorySlug) {
    query += ` AND c.slug = $${paramCount}`;
    params.push(categorySlug);
    paramCount++;
  }

  if (search) {
    query += ` AND (p.title ILIKE $${paramCount} OR p.summary ILIKE $${paramCount} OR p.content ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  
  // Ayrıca toplam sayıyı da dönelim pagination için
  let countQuery = `SELECT COUNT(*) FROM posts p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = 'published'`;
  const countParams = [];
  let countParamIndex = 1;
  if (categorySlug) {
    countQuery += ` AND c.slug = $${countParamIndex}`;
    countParams.push(categorySlug);
    countParamIndex++;
  }
  if (search) {
    countQuery += ` AND (p.title ILIKE $${countParamIndex} OR p.summary ILIKE $${countParamIndex} OR p.content ILIKE $${countParamIndex})`;
    countParams.push(`%${search}%`);
    countParamIndex++;
  }
  
  const countResult = await pool.query(countQuery, countParams);
  
  return {
    posts: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
}

async function getPostBySlug(slug) {
  const result = await pool.query(
    `SELECT p.*, COALESCE(u.username, 'ESPN Bot') as author, u.avatar_url as author_avatar, u.bio as author_bio, c.name as category_name, c.slug as category_slug
     FROM posts p
     LEFT JOIN users u ON p.user_id = u.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.slug = $1 AND p.status = 'published'`,
    [slug]
  );
  return result.rows[0];
}

async function getPostById(id) {
  const result = await pool.query(
    `SELECT p.*, COALESCE(u.username, 'ESPN Bot') as author, c.name as category_name 
     FROM posts p
     LEFT JOIN users u ON p.user_id = u.id
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = $1`, 
    [id]
  );
  return result.rows[0];
}

async function incrementViews(id) {
  await pool.query('UPDATE posts SET views = views + 1 WHERE id = $1', [id]);
}

async function createPost({ title, slug, summary, content, category_id, image_url, status, seo_title, seo_description, user_id }) {
  const result = await pool.query(
    `INSERT INTO posts (title, slug, summary, content, category_id, image_url, status, seo_title, seo_description, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [title, slug, summary, content, category_id, image_url, status, seo_title, seo_description, user_id]
  );
  return result.rows[0];
}

async function updatePost(id, { title, slug, summary, content, category_id, image_url, status, seo_title, seo_description }) {
  const result = await pool.query(
    `UPDATE posts
     SET title = $1, slug = $2, summary = $3, content = $4, category_id = $5, image_url = $6, status = $7, seo_title = $8, seo_description = $9
     WHERE id = $10 RETURNING *`,
    [title, slug, summary, content, category_id, image_url, status, seo_title, seo_description, id]
  );
  return result.rows[0];
}

async function deletePost(id) {
  const result = await pool.query(
    'DELETE FROM posts WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getAllPosts,
  getPostBySlug,
  getPostById,
  incrementViews,
  createPost,
  updatePost,
  deletePost,
};
