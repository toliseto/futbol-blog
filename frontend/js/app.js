// Backend API adresleri
const API_URL = '/api/posts';
const AUTH_URL = '/api/auth';

let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let currentToken = localStorage.getItem('token') || null;

const views = {
  list: document.getElementById('view-list'),
  detail: document.getElementById('view-detail'),
  new: document.getElementById('view-new'),
  login: document.getElementById('view-login'),
  register: document.getElementById('view-register'),
  admin: document.getElementById('view-admin'),
};

const navLinks = document.querySelectorAll('.nav-link');
const postsGrid = document.getElementById('posts-grid');
const postDetail = document.getElementById('post-detail');
const backLink = document.getElementById('back-to-list');

const newPostForm = document.getElementById('new-post-form');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const formStatus = document.getElementById('form-status');
const loginStatus = document.getElementById('login-status');
const registerStatus = document.getElementById('register-status');
const usersList = document.getElementById('users-list');
const logoutBtn = document.getElementById('logout-btn');

function updateNav() {
  document.querySelectorAll('.auth-req').forEach(el => el.hidden = !currentUser);
  document.querySelectorAll('.guest-req').forEach(el => el.hidden = !!currentUser);
  document.querySelectorAll('.admin-req').forEach(el => el.hidden = !(currentUser && currentUser.role === 'admin'));
}

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    if (el) el.hidden = key !== name;
  });
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.dataset.view === name);
  });
  
  if (name === 'admin' && currentUser && currentUser.role === 'admin') {
    loadUsers();
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getAuthHeaders() {
  return currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {};
}

async function loadPosts() {
  postsGrid.innerHTML = '<p class="status-text">Yazılar yükleniyor…</p>';
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Sunucu hatası');
    const posts = await res.json();

    if (posts.length === 0) {
      postsGrid.innerHTML = '<p class="status-text">Henüz yazı yok.</p>';
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
    postsGrid.innerHTML = `<p class="status-text">Yazılar yüklenemedi.</p>`;
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

    let deleteBtnHtml = '';
    if (currentUser && currentUser.role === 'admin') {
      deleteBtnHtml = `<button class="btn-danger" onclick="deletePost(${post.id})" style="margin-top:20px;background:red;color:white;border:none;padding:8px 12px;cursor:pointer;">Yazıyı Sil (Admin)</button>`;
    }

    postDetail.innerHTML = `
      ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" />` : ''}
      <div class="post-card__meta">${post.author} · ${formatDate(post.created_at)}</div>
      <h1>${post.title}</h1>
      <div class="post-detail__body">${post.content}</div>
      ${deleteBtnHtml}
    `;
  } catch (err) {
    postDetail.innerHTML = '<p class="status-text">Yazı yüklenemedi.</p>';
    console.error(err);
  }
}

window.deletePost = async function(id) {
  if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Silinemedi');
    alert('Yazı silindi.');
    showView('list');
    loadPosts();
  } catch (err) {
    alert('Hata oluştu.');
  }
}

// Authentication Forms
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginStatus.textContent = 'Giriş yapılıyor...';
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());
  
  try {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Giriş başarısız');
    
    currentUser = data.user;
    currentToken = data.token;
    localStorage.setItem('user', JSON.stringify(currentUser));
    localStorage.setItem('token', currentToken);
    
    loginForm.reset();
    loginStatus.textContent = '';
    updateNav();
    showView('list');
  } catch (err) {
    loginStatus.textContent = err.message;
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerStatus.textContent = 'Kayıt olunuyor...';
  const formData = new FormData(registerForm);
  const payload = Object.fromEntries(formData.entries());
  
  try {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Kayıt başarısız');
    
    registerForm.reset();
    registerStatus.textContent = 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.';
  } catch (err) {
    registerStatus.textContent = err.message;
  }
});

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  currentToken = null;
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  updateNav();
  showView('list');
});

newPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(newPostForm);
  const payload = Object.fromEntries(formData.entries());

  formStatus.textContent = 'Yayınlanıyor…';
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Yazı oluşturulamadı');

    newPostForm.reset();
    formStatus.textContent = '';
    showView('list');
    loadPosts();
  } catch (err) {
    formStatus.textContent = err.message;
  }
});

// Admin Panel
async function loadUsers() {
  usersList.innerHTML = 'Yükleniyor...';
  try {
    const res = await fetch(`${AUTH_URL}/users`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Yetkisiz');
    const users = await res.json();
    
    usersList.innerHTML = users.map(u => `
      <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; display:flex; justify-content:space-between;">
        <span>${u.username} (${u.role})</span>
        ${u.role !== 'admin' ? `<button onclick="deleteUser(${u.id})" style="background:red;color:white;border:none;cursor:pointer;">Sil</button>` : ''}
      </div>
    `).join('');
  } catch (err) {
    usersList.innerHTML = 'Kullanıcılar yüklenemedi.';
  }
}

window.deleteUser = async function(id) {
  if (!confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) return;
  try {
    const res = await fetch(`${AUTH_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Silinemedi');
    loadUsers();
  } catch (err) {
    alert('Hata oluştu.');
  }
}

backLink.addEventListener('click', () => showView('list'));
navLinks.forEach((link) => {
  if (link.dataset.view) {
    link.addEventListener('click', () => showView(link.dataset.view));
  }
});

// İlk yükleme
updateNav();
loadPosts();
