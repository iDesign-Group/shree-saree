const API = 'http://localhost:5000/api';

// Check if logged in on every page load
const publicPages = ['index.html', '/'];
const currentPage = window.location.pathname.split('/').pop();

if (!publicPages.includes(currentPage) && currentPage !== '') {
    const token = localStorage.getItem('ss_token');
    if (!token) window.location.href = 'index.html';
}

// Set admin name in sidebar
const adminData = JSON.parse(localStorage.getItem('ss_user') || '{}');
const adminNameEl = document.getElementById('adminName');
if (adminNameEl) adminNameEl.textContent = adminData.name || 'Admin';

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        const errEl = document.getElementById('loginError');
        btn.textContent = 'Logging in...';
        btn.disabled = true;
        errEl.classList.add('hidden');

        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('ss_token', data.token);
                localStorage.setItem('ss_user',
                    JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                errEl.textContent = data.message;
                errEl.classList.remove('hidden');
            }
        } catch (err) {
            errEl.textContent = 'Server error. Please try again.';
            errEl.classList.remove('hidden');
        }
        btn.textContent = 'Login to Admin Panel';
        btn.disabled = false;
    });
}

// API helper — authenticated requests
const apiCall = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('ss_token');
    const opts = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API}${endpoint}`, opts);
    if (res.status === 401) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
    return res.json();
};

// API helper — for file uploads (FormData)
const apiUpload = async (endpoint, formData) => {
    const token = localStorage.getItem('ss_token');
    const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    if (res.status === 401) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
    return res.json();
};

// Modal helpers
const openModal = (id) => {
    document.getElementById(id).classList.add('active');
};
const closeModal = (id) => {
    document.getElementById(id).classList.remove('active');
};

// Logout
const logout = () => {
    localStorage.clear();
    window.location.href = 'index.html';
};
