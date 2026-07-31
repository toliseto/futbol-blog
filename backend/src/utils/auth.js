// Parola güç kontrolü vb. yardımcı fonksiyonlar
const crypto = require('crypto');

const isPasswordStrong = (password) => {
  // En az 10 karakter, 1 harf, 1 rakam
  if (password.length < 10) return false;
  if (password.length > 100) return false;
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasLetter && hasNumber;
};

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  isPasswordStrong,
  generateToken,
  hashToken
};
