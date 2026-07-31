const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_super_gizli';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Yetkisiz erişim. Lütfen giriş yapın.', 'UNAUTHORIZED', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return sendError(res, 'Geçersiz veya süresi dolmuş token.', 'INVALID_TOKEN', 401);
  }
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendError(res, 'Bu işlem için yönetici (admin) yetkisi gereklidir.', 'FORBIDDEN', 403);
  }
}

// Ek olarak Yazar (Author) veya Editor (Editor) rollerine izin veren middleware
function requireAuthorOrAdmin(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'editor' || req.user.role === 'author')) {
    next();
  } else {
    return sendError(res, 'Bu işlem için yetkiniz bulunmamaktadır.', 'FORBIDDEN', 403);
  }
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireAuthorOrAdmin
};
