# Saha — Basit Futbol Blogu

Frontend ve backend'i tamamen ayrı, modüler dosyalardan oluşan basit bir futbol blog sitesi.

```~
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

## Railway'e deploy etme

Bu repo, kökte bir `package.json` içerir; bu sayede Railway'de "Root Directory" ayarıyla uğraşmana gerek kalmaz — Railway kurulumda otomatik olarak `backend` klasörüne girip bağımlılıkları kurar ve sunucuyu başlatır.

1. Railway'de yeni bir proje oluştur, bu GitHub reposunu bağla
2. Aynı projeye **New → Database → PostgreSQL** ile bir Postgres eklentisi ekle
3. Backend servisinin **Variables** sekmesinde, Postgres servisinden gelen `DATABASE_URL` değişkeninin bağlı (referenced) olduğunu kontrol et — genelde Railway bunu otomatik ekler
4. Postgres servisinin **Query** / **Data** sekmesini aç, bu repodaki `backend/database/schema.sql` dosyasının içeriğini yapıştırıp çalıştır (tabloları ve örnek yazıları oluşturur)
5. Backend servisini deploy et; loglarda `PostgreSQL veritabanına bağlanıldı.` yazısını görmen gerekir

Kod, `DATABASE_URL` değişkeni varsa onu, yoksa (yerel geliştirme için) `.env` dosyasındaki `DB_*` değişkenlerini otomatik kullanır (bkz. `backend/src/config/db.js`).

## Notlar

- Kod bilinçli olarak basit tutuldu: kimlik doğrulama, sayfalama gibi ekstra özellikler yok.
- Yeni bir alan/route eklemek istersen ilgili klasöre (models/controllers/routes) küçük bir dosya eklemen yeterli.
