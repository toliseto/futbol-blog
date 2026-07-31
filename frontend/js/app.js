// Backend API adresleri
const API_URL = '/api/posts';
const AUTH_URL = '/api/auth';

let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let currentToken = localStorage.getItem('token') || null;

// DOM Elements
const views = {
  list: document.getElementById('view-list'),
  detail: document.getElementById('view-detail'),
  new: document.getElementById('view-new'),
  login: document.getElementById('view-login'),
  register: document.getElementById('view-register'),
  admin: document.getElementById('view-admin'),
  'kvkk-policy': document.getElementById('view-kvkk-policy'),
  'privacy-policy': document.getElementById('view-privacy-policy'),
  'cookie-policy': document.getElementById('view-cookie-policy'),
};

const siteHeader = document.getElementById('site-header');
const navLinks = document.querySelectorAll('.nav-link');
const postsGrid = document.getElementById('posts-grid');
const postDetail = document.getElementById('post-detail');
const heroMainCard = document.getElementById('hero-main-card');
const heroSidebarCards = document.getElementById('hero-sidebar-cards');
const usersList = document.getElementById('users-list');

// Forms & Buttons
const newPostForm = document.getElementById('new-post-form');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const toastContainer = document.getElementById('toast-container');
const regPwd = document.getElementById('register-password');
const pwdStrength = document.getElementById('pwd-strength');

// Scroll Event for Header Shadow
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    siteHeader.classList.add('is-scrolled');
  } else {
    siteHeader.classList.remove('is-scrolled');
  }
});

// Toast System
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '';
  if (type === 'success') icon = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
  else if (type === 'error') icon = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  
  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
    <span class="toast-close">&times;</span>
  `;
  
  toastContainer.appendChild(toast);
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  });
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

// Theme Toggle
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const target = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', target);
  localStorage.setItem('theme', target);
  updateThemeIcon(target);
}

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    themeToggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
  } else {
    themeToggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  }
}

themeToggleBtn.addEventListener('click', toggleTheme);
initTheme();

// Navigation & View Logic
function updateNav() {
  document.querySelectorAll('.auth-req').forEach(el => el.hidden = !currentUser);
  document.querySelectorAll('.guest-req').forEach(el => el.hidden = !!currentUser);
  document.querySelectorAll('.admin-req').forEach(el => el.hidden = !(currentUser && currentUser.role === 'admin'));
  document.querySelectorAll('.author-req').forEach(el => el.hidden = !(currentUser && ['admin', 'editor', 'author'].includes(currentUser.role)));
  
  const avatar = document.getElementById('user-avatar-btn');
  if (currentUser && avatar) {
    avatar.textContent = currentUser.username.charAt(0).toUpperCase();
  }
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
  
  window.scrollTo(0, 0);
}

document.querySelectorAll('[data-view]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const view = btn.dataset.view;
    if (view === 'category') {
      const slug = btn.dataset.slug;
      showView('list');
      loadPosts(slug);
      return;
    }
    if (view === 'list') {
      loadPosts();
    }
    showView(view);
  });
});

document.addEventListener('navigate-to-view', (e) => {
  if (e.detail && e.detail.view) {
    if (e.detail.view === 'list') {
      loadPosts();
    }
    showView(e.detail.view);
  }
});

// Auth & API Helpers
function getAuthHeaders() {
  return currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {};
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Load Posts
async function loadPosts(categorySlug = null) {
  try {
    let url = API_URL;
    if (categorySlug) {
      url += `?category=${categorySlug}`;
    }
    const res = await fetch(url);
    const result = await res.json();
    
    if (!result.success) throw new Error(result.error.message);
    
    const posts = result.data.posts;
    if (posts.length === 0) {
      postsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Henüz içerik bulunmuyor.</p>';
      heroMainCard.style.display = 'none';
      heroSidebarCards.style.display = 'none';
      return;
    }

    // İlk yazıyı Hero'ya koy
    const heroPost = posts[0];
    heroMainCard.style.display = 'flex';
    heroSidebarCards.style.display = 'flex';
    heroMainCard.innerHTML = `
      ${heroPost.image_url ? `<img src="${heroPost.image_url}" class="hero-image" alt="${heroPost.title}">` : ''}
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="category-tag">${heroPost.category_name || 'Genel'}</span>
        <h1 class="hero-title">${heroPost.title}</h1>
        <div class="hero-meta">
          <span>${heroPost.author}</span>
          <span>•</span>
          <span>${formatDate(heroPost.created_at)}</span>
        </div>
      </div>
    `;
    heroMainCard.onclick = () => openPost(heroPost.slug || heroPost.id);

    // Sonraki 3 yazıyı Sidebar'a koy
    const sidebarPosts = posts.slice(1, 4);
    heroSidebarCards.innerHTML = '';
    sidebarPosts.forEach(p => {
      heroSidebarCards.innerHTML += `
        <div class="sidebar-card" style="cursor:pointer;" onclick="openPost('${p.slug || p.id}')">
          ${p.image_url ? `<img src="${p.image_url}" class="sidebar-card-img" alt="${p.title}">` : '<div class="sidebar-card-img" style="background:#eee"></div>'}
          <div class="sidebar-card-content">
            <h4>${p.title}</h4>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">${formatDate(p.created_at)}</div>
          </div>
        </div>
      `;
    });

    // Kalan yazıları Grid'e koy (veya hepsini)
    postsGrid.innerHTML = '';
    const gridPosts = posts.slice(4);
    if(gridPosts.length === 0) {
      postsGrid.innerHTML = '<p style="grid-column: 1/-1;">Daha fazla yazı yok.</p>';
    } else {
      gridPosts.forEach((post) => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
          <div class="post-card-img-wrapper">
            ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}">` : '<div style="width:100%; height:100%; background:var(--color-border);"></div>'}
          </div>
          <div class="post-card-content">
            <span class="category-tag" style="align-self:flex-start; margin-bottom:0.5rem; font-size:0.65rem;">${post.category_name || 'Genel'}</span>
            <h2 class="post-card-title">${post.title}</h2>
            <p class="post-card-summary">${post.summary || ''}</p>
            <div class="post-card-footer">
              <span>${post.author}</span>
              <span>${formatDate(post.created_at)}</span>
            </div>
          </div>
        `;
        card.addEventListener('click', () => openPost(post.slug || post.id));
        postsGrid.appendChild(card);
      });
    }
  } catch (err) {
    postsGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--color-danger);">Yazılar yüklenemedi: ${err.message}</p>`;
    showToast(err.message, 'error');
  }
}

async function openPost(slugOrId) {
  showView('detail');
  postDetail.innerHTML = '<div class="skeleton" style="height:400px; border-radius:var(--radius-lg);"></div>';
  try {
    const res = await fetch(`${API_URL}/${slugOrId}`);
    const result = await res.json();
    if (!result.success) throw new Error(result.error.message);
    
    const post = result.data.post;

    let deleteBtnHtml = '';
    if (currentUser && (currentUser.role === 'admin' || currentUser.id === post.user_id)) {
      deleteBtnHtml = `<button class="btn btn-primary" onclick="deletePost(${post.id})" style="margin-top:20px;background:var(--color-danger);color:white;border:none;">Yazıyı Sil</button>`;
    }

    postDetail.innerHTML = `
      <div class="post-detail-header">
        <span class="category-tag" style="margin-bottom:var(--space-md);">${post.category_name || 'Genel'}</span>
        <h1 class="post-detail-title">${post.title}</h1>
        <div class="post-detail-meta">
          <span>${post.author}</span>
          <span>•</span>
          <span>${formatDate(post.created_at)}</span>
          <span>•</span>
          <span>${post.views || 0} Okunma</span>
        </div>
      </div>
      ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" class="post-detail-image" />` : ''}
      <div class="post-detail-body">${post.content}</div>
      ${deleteBtnHtml}
    `;
  } catch (err) {
    postDetail.innerHTML = `<p style="color:var(--color-danger);">Yazı yüklenemedi: ${err.message}</p>`;
    showToast(err.message, 'error');
  }
}

window.deletePost = async function(id) {
  if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error.message);
    
    showToast('Yazı başarıyla silindi.', 'success');
    showView('list');
    loadPosts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Authentication Forms
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());
  const btn = loginForm.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Bekleyin...';
  
  try {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error.message);
    
    currentUser = result.data.user;
    currentToken = result.data.token;
    localStorage.setItem('user', JSON.stringify(currentUser));
    localStorage.setItem('token', currentToken);
    
    loginForm.reset();
    updateNav();
    showToast(result.message, 'success');
    showView('list');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Giriş Yap';
  }
});

// Parola Güç Göstergesi
if (regPwd && pwdStrength) {
  regPwd.addEventListener('input', () => {
    const val = regPwd.value;
    let score = 0;
    if (val.length >= 10) score += 33;
    if (/[a-zA-Z]/.test(val)) score += 33;
    if (/\d/.test(val)) score += 34;
    
    pwdStrength.style.width = score + '%';
    if (score < 50) pwdStrength.style.backgroundColor = 'var(--color-danger)';
    else if (score < 100) pwdStrength.style.backgroundColor = 'var(--color-warning)';
    else pwdStrength.style.backgroundColor = 'var(--color-success)';
  });
}

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(registerForm);
  const payload = Object.fromEntries(formData.entries());
  const btn = registerForm.querySelector('button');
  btn.disabled = true;
  
  try {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error.message);
    
    registerForm.reset();
    if (pwdStrength) pwdStrength.style.width = '0';
    showToast(result.message + ' Giriş yapabilirsiniz.', 'success');
    showView('login');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  currentToken = null;
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  updateNav();
  showToast('Başarıyla çıkış yapıldı.', 'success');
  showView('list');
});

// Yeni Yazı
newPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(newPostForm);
  const payload = Object.fromEntries(formData.entries());
  const btn = newPostForm.querySelector('button');
  btn.disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error.message);

    newPostForm.reset();
    showToast(result.message, 'success');
    showView('list');
    loadPosts();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

// Admin Panel
async function loadUsers() {
  usersList.innerHTML = '<tr><td colspan="5">Yükleniyor...</td></tr>';
  try {
    const res = await fetch(`${AUTH_URL}/users`, { headers: getAuthHeaders() });
    const result = await res.json();
    if (!result.success) throw new Error(result.error.message);
    
    const users = result.data.users;
    usersList.innerHTML = users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td><span class="category-tag" style="font-size:0.7rem;">${u.role}</span></td>
        <td>${formatDate(u.created_at)}</td>
        <td>
          ${u.role !== 'admin' ? `<button onclick="deleteUser(${u.id})" style="color:var(--color-danger); cursor:pointer;">Sil</button>` : '-'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    usersList.innerHTML = `<tr><td colspan="5" style="color:red;">Kullanıcılar yüklenemedi: ${err.message}</td></tr>`;
  }
}

window.deleteUser = async function(id) {
  if (!confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) return;
  try {
    const res = await fetch(`${AUTH_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error.message);
    showToast('Kullanıcı silindi', 'success');
    loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Admin Tab Logic
document.querySelectorAll('[data-admin-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[data-admin-tab]').forEach(t => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    // For now, only users view exists
    loadUsers();
  });
});

// Initialize
updateNav();
loadPosts();
