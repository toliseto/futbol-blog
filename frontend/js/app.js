// Backend API adresi (gerekirse değiştirin)
const API_URL = 'soothing-friendship-production-c654.up.railway.app';

const views = {
  list: document.getElementById('view-list'),
  detail: document.getElementById('view-detail'),
  new: document.getElementById('view-new'),
};

const navLinks = document.querySelectorAll('.nav-link');
const postsGrid = document.getElementById('posts-grid');
const postDetail = document.getElementById('post-detail');
const backLink = document.getElementById('back-to-list');
const newPostForm = document.getElementById('new-post-form');
const formStatus = document.getElementById('form-status');

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    el.hidden = key !== name;
  });
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.dataset.view === name);
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

async function loadPosts() {
  postsGrid.innerHTML = '<p class="status-text">Yazılar yükleniyor…</p>';
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Sunucu hatası');
    const posts = await res.json();

    if (posts.length === 0) {
      postsGrid.innerHTML = '<p class="status-text">Henüz yazı yok. İlk yazıyı sen ekle!</p>';
      return;
    }

    postsGrid.innerHTML = '';
    posts.forEach((post) => {
      const card = document.createElement('div');
      card.className = 'post-card';
      card.innerHTML = `
        <div class="post-card__meta">${post.author} · ${formatDate(post.created_at)}</div>
        <h2>${post.title}</h2>
        <p>${post.content.slice(0, 120)}${post.content.length > 120 ? '…' : ''}</p>
      `;
      card.addEventListener('click', () => openPost(post.id));
      postsGrid.appendChild(card);
    });
  } catch (err) {
    postsGrid.innerHTML = `<p class="status-text">Yazılar yüklenemedi. Backend'in çalıştığından emin olun.</p>`;
    console.error(err);
  }
}

async function openPost(id) {
  showView('detail');
  postDetail.innerHTML = '<p class="status-text">Yükleniyor…</p>';
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Yazı bulunamadı');
    const post = await res.json();

    postDetail.innerHTML = `
      ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" />` : ''}
      <div class="post-card__meta">${post.author} · ${formatDate(post.created_at)}</div>
      <h1>${post.title}</h1>
      <div class="post-detail__body">${post.content}</div>
    `;
  } catch (err) {
    postDetail.innerHTML = '<p class="status-text">Yazı yüklenemedi.</p>';
    console.error(err);
  }
}

newPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(newPostForm);
  const payload = {
    title: formData.get('title'),
    author: formData.get('author') || 'Editör',
    content: formData.get('content'),
    image_url: formData.get('image_url') || null,
  };

  formStatus.textContent = 'Yayınlanıyor…';
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Yazı oluşturulamadı');

    newPostForm.reset();
    formStatus.textContent = 'Yazı yayınlandı!';
    showView('list');
    loadPosts();
  } catch (err) {
    formStatus.textContent = 'Bir hata oluştu, tekrar deneyin.';
    console.error(err);
  }
});

backLink.addEventListener('click', () => showView('list'));

navLinks.forEach((link) => {
  link.addEventListener('click', () => showView(link.dataset.view));
});

// İlk yükleme
loadPosts();
