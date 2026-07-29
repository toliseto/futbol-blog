const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_super_gizli';

async function register(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }
    
    const existing = await userModel.getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // İlk kullanıcıysa admin yapalım (basit bir mantık)
    // Ya da şimdilik herkesi 'user' yapalım, veritabanından manuel admin verir.
    // Şimdilik herkes 'user'
    const newUser = await userModel.createUser({ username, password_hash, role: 'user' });

    res.status(201).json({ message: 'Kayıt başarılı.', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kayıt olurken bir hata oluştu.' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }

    const user = await userModel.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Giriş başarılı.', token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Giriş yaparken bir hata oluştu.' });
  }
}

async function listUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kullanıcılar listelenirken hata oluştu.' });
  }
}

async function removeUser(req, res) {
  try {
    const deleted = await userModel.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    res.json({ message: 'Kullanıcı başarıyla silindi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kullanıcı silinirken hata oluştu.' });
  }
}

module.exports = {
  register,
  login,
  listUsers,
  removeUser
};
