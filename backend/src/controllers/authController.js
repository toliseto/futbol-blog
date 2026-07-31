const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { sendSuccess, sendError } = require('../utils/response');
const { isPasswordStrong, generateToken, hashToken } = require('../utils/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_super_gizli';

async function register(req, res) {
  try {
    const { username, password } = req.body;
    
    // Girdi kontrolü
    if (!username || !password) {
      return sendError(res, 'Kullanıcı adı ve şifre zorunludur.', 'VALIDATION_ERROR');
    }

    if (username.length < 3 || username.length > 30) {
      return sendError(res, 'Kullanıcı adı 3 ile 30 karakter arasında olmalıdır.', 'VALIDATION_ERROR');
    }

    if (!isPasswordStrong(password)) {
      return sendError(res, 'Şifre çok zayıf. En az 10 karakter, 1 harf ve 1 rakam içermelidir.', 'WEAK_PASSWORD');
    }
    
    if (username.toLowerCase() === password.toLowerCase()) {
      return sendError(res, 'Şifre kullanıcı adıyla aynı olamaz.', 'WEAK_PASSWORD');
    }

    const existing = await userModel.getUserByUsername(username);
    if (existing) {
      return sendError(res, 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.', 'VALIDATION_ERROR'); // Varlığı ifşa etmemek için genel hata (tercihen email için yapılır ama username için de geçerli)
    }

    const salt = await bcrypt.genSalt(12); // Cost artırıldı
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await userModel.createUser({ username, password_hash, role: 'user' });

    return sendSuccess(res, { user: newUser }, 'Kayıt başarılı.', 201);
  } catch (err) {
    console.error(err);
    return sendError(res, 'Kayıt olurken bir hata oluştu.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return sendError(res, 'Kullanıcı adı ve şifre zorunludur.', 'VALIDATION_ERROR');
    }

    const user = await userModel.getUserByUsername(username);
    if (!user) {
      return sendError(res, 'E-posta veya şifre hatalı.', 'UNAUTHORIZED', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'E-posta veya şifre hatalı.', 'UNAUTHORIZED', 401);
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    return sendSuccess(res, { token, user: payload }, 'Giriş başarılı.');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Giriş yaparken bir hata oluştu.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

async function forgotPassword(req, res) {
  try {
    const { username } = req.body;
    if (!username) {
      return sendError(res, 'Kullanıcı adı zorunludur.', 'VALIDATION_ERROR');
    }

    const user = await userModel.getUserByUsername(username);
    
    // Güvenlik: Kullanıcı olmasa da aynı mesajı dön (User Enumeration koruması)
    const successMsg = "Eğer bu hesap sistemimizde mevcutsa, şifre sıfırlama talimatları e-posta adresinize gönderilecektir.";

    if (!user) {
      return sendSuccess(res, null, successMsg);
    }

    // Token oluştur
    const resetToken = generateToken();
    const hashedToken = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 dakika

    await userModel.setPasswordResetToken(user.id, hashedToken, expiresAt);

    // TODO: Gerçek e-posta gönderimi entegre edilecek. 
    // Şimdilik geliştirme ortamı için log basalım (Production'da kaldırılmalı).
    if (process.env.NODE_ENV !== 'production') {
      console.log(\`[DEV ONLY] Şifre Sıfırlama Tokenı (\${username}): \${resetToken}\`);
    }

    return sendSuccess(res, null, successMsg);
  } catch (err) {
    console.error(err);
    return sendError(res, 'İşlem sırasında bir hata oluştu.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return sendError(res, 'Token ve yeni şifre zorunludur.', 'VALIDATION_ERROR');
    }

    if (!isPasswordStrong(newPassword)) {
      return sendError(res, 'Şifre çok zayıf. En az 10 karakter, 1 harf ve 1 rakam içermelidir.', 'WEAK_PASSWORD');
    }

    const hashedToken = hashToken(token);
    const user = await userModel.getUserByResetToken(hashedToken);

    if (!user) {
      return sendError(res, 'Geçersiz veya süresi dolmuş token.', 'INVALID_TOKEN', 400);
    }

    // Yeni şifreyi hashle ve kaydet
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await userModel.updatePasswordAndClearToken(user.id, password_hash);

    return sendSuccess(res, null, 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.');
  } catch (err) {
    console.error(err);
    return sendError(res, 'İşlem sırasında bir hata oluştu.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

async function getMe(req, res) {
  try {
    const user = await userModel.getUserById(req.user.id);
    if (!user) return sendError(res, 'Kullanıcı bulunamadı.', 'NOT_FOUND', 404);
    return sendSuccess(res, { user });
  } catch (err) {
    return sendError(res, 'Profil alınamadı', 'INTERNAL_SERVER_ERROR', 500);
  }
}

async function updateMe(req, res) {
  try {
    const { bio, avatar_url } = req.body;
    const updatedUser = await userModel.updateProfile(req.user.id, { bio, avatar_url });
    return sendSuccess(res, { user: updatedUser }, 'Profil güncellendi');
  } catch (err) {
    return sendError(res, 'Profil güncellenemedi', 'INTERNAL_SERVER_ERROR', 500);
  }
}

async function listUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    return sendSuccess(res, { users });
  } catch (err) {
    console.error(err);
    return sendError(res, 'Kullanıcılar listelenirken hata oluştu.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

async function removeUser(req, res) {
  try {
    const deleted = await userModel.deleteUser(req.params.id);
    if (!deleted) {
      return sendError(res, 'Kullanıcı bulunamadı.', 'NOT_FOUND', 404);
    }
    return sendSuccess(res, null, 'Kullanıcı başarıyla silindi.');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Kullanıcı silinirken hata oluştu.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  listUsers,
  removeUser
};
