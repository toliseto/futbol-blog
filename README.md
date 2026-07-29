# Saha — Basit Futbol Blogu

Frontend ve backend'i tamamen ayrı, modüler dosyalardan oluşan basit bir futbol blog sitesi.

```
futbol-blog/
├── backend/                  # Node.js + Express + PostgreSQL API
│   ├── database/
│   │   └── schema.sql        # Tablo + örnek futbol yazıları
│   ├── src/
│   │   ├── config/db.js      # PostgreSQL bağlantısı
│   │   ├── models/postModel.js
│   │   ├── controllers/postController.js
│   │   ├── routes/postRoutes.js
│   │   └── app.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/                  # Sade HTML/CSS/JS arayüz
    ├── index.html
    ├── css/style.css
    └── js/app.js
```

## 1. Veritabanını kur

PostgreSQL kurulu olmalı. Bir veritabanı oluşturup şemayı çalıştırın:

```bash
createdb futbol_blog
psql -d futbol_blog -f backend/database/schema.sql
```

## 2. Backend'i çalıştır

```bash
cd backend
cp .env.example .env   # .env dosyasındaki bilgileri kendi PostgreSQL ayarlarınıza göre düzenleyin
npm install
npm start
```

API `http://localhost:5000` adresinde çalışır.

Uç noktalar:
- `GET    /api/posts` — tüm yazılar
- `GET    /api/posts/:id` — tek yazı
- `POST   /api/posts` — yeni yazı ekle
- `PUT    /api/posts/:id` — yazı güncelle
- `DELETE /api/posts/:id` — yazı sil

## 3. Frontend'i aç

`frontend/index.html` dosyasını doğrudan tarayıcıda açabilir, ya da basit bir sunucuyla servis edebilirsiniz:

```bash
cd frontend
npx serve .
```

Frontend, `js/app.js` içindeki `API_URL` değişkeni üzerinden backend'e bağlanır. Backend farklı bir adreste çalışıyorsa bu satırı güncelleyin.

## Notlar

- Kod bilinçli olarak basit tutuldu: kimlik doğrulama, sayfalama gibi ekstra özellikler yok.
- Yeni bir alan/route eklemek istersen ilgili klasöre (models/controllers/routes) küçük bir dosya eklemen yeterli.
