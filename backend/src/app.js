const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const cron = require('node-cron');
const { fetchAndSaveESPNNews } = require('./services/espnScraper');

const app = express();

// ESPN Bot Cron Job - Her saat başı çalışır (0 * * * *)
// Test amaçlı ilk başlangıçta da çalıştıralım:
setTimeout(() => {
  fetchAndSaveESPNNews();
}, 5000); // Sunucu başladıktan 5 saniye sonra ilk tarama

cron.schedule('0 * * * *', () => {
  fetchAndSaveESPNNews();
});

// Security Headers (Helmet)
// Sadece gerekli olanlara izin vermek için yapılandırma
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://collie-activate-grumbly.ngrok-free.dev", "https://www.googletagmanager.com"], // GTM and Ngrok for demo
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "https://collie-activate-grumbly.ngrok-free.dev"]
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Rate Limiting (Genel)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına 100 istek
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin."
    }
  }
});
app.use(limiter);

app.use(cors());
app.use(express.json({ limit: '10kb' })); // JSON payload boyutu sınırlandırması

// API route'ları
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// Frontend statik dosyalarını sunma
app.use(express.static(path.join(__dirname, '../../frontend')));

// Tanımlanamayan tüm route'ları frontend'e yönlendir (SPA davranışı için)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Sunucu tarafında beklenmeyen bir hata oluştu."
    }
  });
});

module.exports = app;
