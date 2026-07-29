const express = require('express');
const cors = require('cors');
const path = require('path');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// API route'ları
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// Frontend statik dosyalarını sunma
app.use(express.static(path.join(__dirname, '../../frontend')));

// Tanımlanamayan tüm route'ları frontend'e yönlendir (SPA davranışı için)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

module.exports = app;
