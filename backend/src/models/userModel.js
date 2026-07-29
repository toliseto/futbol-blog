const pool = require('../config/db');

async function createUser({ username, password_hash, role = 'user' }) {
  const result = await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
    [username, password_hash, role]
  );
  return result.rows[0];
}

async function getUserByUsername(username) {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}

async function getUserById(id) {
  const result = await pool.query('SELECT id, username, role, created_at FROM users WHERE id = $1', [id]);
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

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  getAllUsers,
  deleteUser
};
