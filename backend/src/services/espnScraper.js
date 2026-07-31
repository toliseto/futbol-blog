const Parser = require('rss-parser');
const pool = require('../config/db');
const postModel = require('../models/postModel');

const parser = new Parser();
const FEED_URL = 'https://www.espn.com/espn/rss/soccer/news';

function slugify(text) {
  const trMap = { 'çÇ': 'c', 'ğĞ': 'g', 'şŞ': 's', 'üÜ': 'u', 'ıİ': 'i', 'öÖ': 'o' };
  for (let key in trMap) {
    text = text.replace(new RegExp('[' + key + ']', 'g'), trMap[key]);
  }
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchAndSaveESPNNews() {
  console.log('[ESPN Bot] RSS Feed kontrol ediliyor...');
  try {
    const feed = await parser.parseURL(FEED_URL);
    
    // Genel kategorisinin ID'sini bul
    const catResult = await pool.query(`SELECT id FROM categories WHERE slug = 'genel' LIMIT 1`);
    let categoryId = null;
    if (catResult.rows.length > 0) {
      categoryId = catResult.rows[0].id;
    }

    let addedCount = 0;

    // Haberleri sondan başa doğru (en eskiyi önce) işlemek mantıklı olabilir,
    // ancak rss genelde en yeniyi üstte verir.
    for (const item of feed.items) {
      const title = item.title;
      const link = item.link;
      const pubDate = item.pubDate;
      const description = item.contentSnippet || item.content || '';

      // Başlığa göre kontrol et (Önceden eklendi mi?)
      const existCheck = await pool.query(`SELECT id FROM posts WHERE title = $1`, [title]);
      if (existCheck.rows.length === 0) {
        // Yeni Haber
        let baseSlug = slugify(title);
        // Benzersiz yap
        const randomString = Math.random().toString(36).substring(2, 8);
        const slug = `${baseSlug}-${randomString}`;
        
        const content = `${description}<br><br><a href="${link}" target="_blank" rel="noopener noreferrer">ESPN Üzerinde Okumaya Devam Et</a>`;
        
        let imageUrl = item.enclosure?.url || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

        await postModel.createPost({
          title: title,
          slug: slug,
          summary: description.substring(0, 150) + '...',
          content: content,
          category_id: categoryId,
          image_url: imageUrl,
          status: 'published',
          seo_title: title,
          seo_description: description.substring(0, 150),
          user_id: null // Bot olduğu için
        });
        
        addedCount++;
        console.log(`[ESPN Bot] Eklendi: ${title}`);
      }
    }
    
    console.log(`[ESPN Bot] Tarama bitti. ${addedCount} yeni haber eklendi.`);
  } catch (err) {
    console.error('[ESPN Bot] Hata oluştu:', err);
  }
}

module.exports = {
  fetchAndSaveESPNNews
};
