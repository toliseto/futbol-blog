require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    });

const migrations = [
  // 1. Categories Table
  `
  CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  `,
  // 2. Tags Table
  `
  CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      slug VARCHAR(50) UNIQUE NOT NULL
  );
  `,
  // 3. Alter users table
  `
  ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reset_token_exp TIMESTAMP;
  `,
  // 4. Alter posts table
  `
  ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS seo_description TEXT;
  `,
  // 5. Post Tags Table
  `
  CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
  );
  `,
  // 6. Comments Table
  `
  CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'approved',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  `,
  // 7. Insert default category (Genel) if not exists
  `
  INSERT INTO categories (name, slug) 
  SELECT 'Genel', 'genel' 
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'genel');
  `,
  // 8. Update existing posts without category to use 'Genel'
  `
  UPDATE posts 
  SET category_id = (SELECT id FROM categories WHERE slug = 'genel') 
  WHERE category_id IS NULL;
  `,
  // 9. Update existing posts to have a slug (using their ID as a temporary slug if null)
  `
  UPDATE posts 
  SET slug = 'post-' || id 
  WHERE slug IS NULL;
  `,
  // 10. Make slug unique
  `
  DO $$ 
  BEGIN 
    BEGIN 
      ALTER TABLE posts ADD CONSTRAINT posts_slug_key UNIQUE (slug); 
    EXCEPTION 
      WHEN duplicate_table THEN NULL; 
      WHEN duplicate_object THEN NULL;
    END; 
  END $$;
  `
];

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Veritabanı kontrol ediliyor...');

    // Öncelikle schema.sql'i çalıştır
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('Temel şema başarıyla çalıştırıldı.');
    
    console.log('Migration başladı...');
    
    for (let i = 0; i < migrations.length; i++) {
      console.log('Adim ' + (i + 1) + ' calistiriliyor...');
      await client.query(migrations[i]);
    }
    
    await client.query('COMMIT');
    console.log('Migration başarıyla tamamlandı!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration hatası:', e);
  } finally {
    client.release();
    pool.end();
  }
}

runMigrations();
