const pool = require('../config/db');

async function createUser({ username, password_hash, role = 'user' }) {
  const result = await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at, avatar_url, bio',
    [username, password_hash, role]
  );
  return result.rows[0];
}

async function getUserByUsername(username) {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}

async function getUserById(id) {
  const result = await pool.query('SELECT id, username, role, created_at, avatar_url, bio FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function getAllUsers() {
  const result = await pool.query('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
}

async function deleteUser(id) {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
}

async function setPasswordResetToken(userId, hashedToken, expiresAt) {
  await pool.query(
    'UPDATE users SET reset_token = $1, reset_token_exp = $2 WHERE id = $3',
    [hashedToken, expiresAt, userId]
  );
}

async function getUserByResetToken(hashedToken) {
  const result = await pool.query(
    'SELECT * FROM users WHERE reset_token = $1 AND reset_token_exp > NOW()',
    [hashedToken]
  );
  return result.rows[0];
}

async function updatePasswordAndClearToken(userId, newPasswordHash) {
  await pool.query(
    'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_exp = NULL WHERE id = $2',
    [newPasswordHash, userId]
  );
}

async function updateProfile(id, { avatar_url, bio }) {
  const result = await pool.query(
    'UPDATE users SET avatar_url = COALESCE($1, avatar_url), bio = COALESCE($2, bio) WHERE id = $3 RETURNING id, username, role, created_at, avatar_url, bio',
    [avatar_url, bio, id]
  );
  return result.rows[0];
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  getAllUsers,
  deleteUser,
  setPasswordResetToken,
  getUserByResetToken,
  updatePasswordAndClearToken,
  updateProfile
};
