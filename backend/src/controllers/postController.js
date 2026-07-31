const postModel = require('../models/postModel');
const { sendSuccess, sendError } = require('../utils/response');
const xss = require('xss');

const xssOptions = {
  whiteList: {
    ...xss.whiteList,
    img: ['src', 'alt', 'width', 'height'],
    iframe: ['src', 'width', 'height', 'allowfullscreen'],
    h1: [],
    h2: []
  }
};
const myXss = new xss.FilterXSS(xssOptions);

function slugify(text) {
  const trMap = { 'çÇ': 'c', 'ğĞ': 'g', 'şŞ': 's', 'üÜ': 'u', 'ıİ': 'i', 'öÖ': 'o' };
  for (let key in trMap) {
    text = text.replace(new RegExp('[' + key + ']', 'g'), trMap[key]);
  }
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '') // alphanumeric harici sil
    .replace(/[\s_-]+/g, '-') // boşlukları ve alt çizgileri tire yap
    .replace(/^-+|-+$/g, ''); // baştaki ve sondaki tireleri sil
}

async function listPosts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // Masaüstünde 3 sütun için 12 güzel bir sayı
    const offset = (page - 1) * limit;
    const categorySlug = req.query.category || null;
    const search = req.query.search || null;

    const { posts, total } = await postModel.getAllPosts(limit, offset, categorySlug, search);
    
    return sendSuccess(res, {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return sendError(res, 'Yazılar yüklenirken hata oluştu.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

async function getPost(req, res) {
  try {
    const { slugOrId } = req.params;
    let post;
    
    // Eğer param bir sayıysa ID olarak dene, değilse slug
    if (/^\d+$/.test(slugOrId)) {
      post = await postModel.getPostById(slugOrId);
    } else {
      post = await postModel.getPostBySlug(slugOrId);
    }

    if (!post) {
      return sendError(res, 'Yazı bulunamadı.', 'NOT_FOUND', 404);
    }
    
    // Görüntülenme sayısını artır (gerçekte IP/Session bazlı yapılmalı ama demo için yeterli)
    await postModel.incrementViews(post.id);
    post.views += 1;

    return sendSuccess(res, { post });
  } catch (err) {
    console.error(err);
    return sendError(res, 'Yazı getirilirken hata oluştu.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

async function createPost(req, res) {
  try {
    let { title, summary, content, category_id, image_url, status, seo_title, seo_description } = req.body;

    if (!title || !content) {
      return sendError(res, 'Başlık ve içerik zorunludur.', 'VALIDATION_ERROR');
    }

    // XSS Koruması
    const cleanContent = myXss.process(content);

    // Slug oluşturma
    let slug = req.body.slug;
    if (!slug) {
      slug = slugify(title) + '-' + Math.floor(Math.random() * 1000); // Benzersiz olması için
    } else {
      slug = slugify(slug);
    }

    if (!status) status = 'draft';

    const newPost = await postModel.createPost({
      title,
      slug,
      summary: summary || title.substring(0, 150) + '...',
      content: cleanContent,
      category_id: category_id || null,
      image_url: image_url || null,
      status,
      seo_title: seo_title || title,
      seo_description: seo_description || summary || title.substring(0, 150),
      user_id: req.user.id
    });

    return sendSuccess(res, { post: newPost }, 'Yazı başarıyla oluşturuldu.', 201);
  } catch (err) {
    console.error(err);
    return sendError(res, 'Yazı oluşturulurken hata oluştu.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

async function updatePost(req, res) {
  try {
    const id = req.params.id;
    let { title, slug, summary, content, category_id, image_url, status, seo_title, seo_description } = req.body;
    
    const existing = await postModel.getPostById(id);
    if (!existing) {
      return sendError(res, 'Yazı bulunamadı.', 'NOT_FOUND', 404);
    }

    // Admin değilse, yazar sadece kendi yazısını güncelleyebilir
    if (req.user.role !== 'admin' && req.user.role !== 'editor' && existing.user_id !== req.user.id) {
      return sendError(res, 'Bu yazıyı düzenleme yetkiniz yok.', 'FORBIDDEN', 403);
    }

    // Kısmi güncelleme (Gönderilmeyen alanları eskisinden al)
    title = title || existing.title;
    content = content || existing.content;
    const cleanContent = myXss.process(content);

    const updatedPost = await postModel.updatePost(id, {
      title,
      slug: slug ? slugify(slug) : existing.slug,
      summary: summary !== undefined ? summary : existing.summary,
      content: cleanContent,
      category_id: category_id !== undefined ? category_id : existing.category_id,
      image_url: image_url !== undefined ? image_url : existing.image_url,
      status: status !== undefined ? status : existing.status,
      seo_title: seo_title !== undefined ? seo_title : existing.seo_title,
      seo_description: seo_description !== undefined ? seo_description : existing.seo_description
    });

    return sendSuccess(res, { post: updatedPost }, 'Yazı başarıyla güncellendi.');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Yazı güncellenirken hata oluştu.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

async function deletePost(req, res) {
  try {
    const id = req.params.id;
    
    const existing = await postModel.getPostById(id);
    if (!existing) {
      return sendError(res, 'Yazı bulunamadı.', 'NOT_FOUND', 404);
    }

    if (req.user.role !== 'admin' && req.user.role !== 'editor' && existing.user_id !== req.user.id) {
      return sendError(res, 'Bu yazıyı silme yetkiniz yok.', 'FORBIDDEN', 403);
    }

    await postModel.deletePost(id);
    return sendSuccess(res, null, 'Yazı başarıyla silindi.');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Yazı silinirken hata oluştu.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost
};
