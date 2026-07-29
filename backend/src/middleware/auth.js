const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_super_gizli';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Bu işlem için yönetici (admin) yetkisi gereklidir.' });
  }
}

module.exports = {
  requireAuth,
  requireAdmin
};
