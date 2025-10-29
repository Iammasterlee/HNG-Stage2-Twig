// public/app.js
// Ticketing App client-side logic (auth + tickets) using localStorage.
// Session key rule: 'ticketapp_session'

(function () {
  // Utils
  const SESSION_KEY = 'ticketapp_session';
  const TICKETS_KEY = 'ticketapp_tickets';
  const USERS_KEY = 'ticketapp_users';

  function el(id) { return document.getElementById(id); }
  function qs(sel) { return document.querySelector(sel); }
  function showToast(message, type = 'info') {
    const root = document.getElementById('toast-root');
    const id = 't' + Date.now();
    const color = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-600' : 'bg-gray-800';
    const html = document.createElement('div');
    html.className = `toast ${id}`;
    html.innerHTML = `
      <div class="${color} text-white px-4 py-2 rounded shadow mb-2 pointer-events-auto">
        ${message}
      </div>
    `;
    root.appendChild(html);
    setTimeout(() => {
      html.remove();
    }, 4000);
  }

  // Storage helpers
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  function findUserByEmail(email) {
    const users = getUsers();
    return users.find(u => u.email === email);
  }

  // Auth helpers
  function setSession(tokenObj) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(tokenObj));
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  }
  function isAuthenticated() {
    return !!getSession();
  }

  // Simple ID generation
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  }

  // Ticket storage functions
  function getTickets() {
    try {
      return JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function saveTickets(tickets) {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  }

  // Validation helpers per spec
  function validateTicket({ title, status, description }) {
    const errors = {};
    if (!title || title.trim().length === 0) {
      errors.title = 'Title is required.';
    } else if (title.trim().length > 120) {
      errors.title = 'Title must be <= 120 characters.';
    }
    const allowed = ['open', 'in_progress', 'closed'];
    if (!status || !allowed.includes(status)) {
      errors.status = 'Status is required and must be open, in_progress, or closed.';
    }
    if (description && description.length > 1000) {
      errors.description = 'Description must be <= 1000 characters.';
    }
    return errors;
  }

  // UI: show/hide logout button based on session
  function updateHeaderUI() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;
    if (isAuthenticated()) {
      logoutBtn.classList.remove('hidden');
    } else {
      logoutBtn.classList.add('hidden');
    }
  }

  // Redirect helper
  function redirect(to) {
    window.location.href = to;
  }

  // ----------------------
  // Auth forms
  // ----------------------
  function initAuthForms() {
    // SIGNUP
    const signupForm = el('signup-form');
    if (signupForm) {
      el('signup-btn').addEventListener('click', () => {
        const name = el('signup-name').value.trim();
        const email = el('signup-email').value.trim();
        const password = el('signup-password').value;

        // clear previous errors
        ['signup-name-error','signup-email-error','signup-password-error'].forEach(id => {
          el(id).classList.add('hidden'); el(id).textContent = '';
        });

        let hasError = false;
        if (!name) { el('signup-name-error').textContent = 'Name is required.'; el('signup-name-error').classList.remove('hidden'); hasError = true; }
        if (!email) { el('signup-email-error').textContent = 'Email is required.'; el('signup-email-error').classList.remove('hidden'); hasError = true; }
        if (!password || password.length < 6) { el('signup-password-error').textContent = 'Password must be at least 6 characters.'; el('signup-password-error').classList.remove('hidden'); hasError = true; }

        if (hasError) return;

        if (findUserByEmail(email)) {
          el('signup-email-error').textContent = 'Email already in use.'; el('signup-email-error').classList.remove('hidden'); return;
        }

        const user = { id: uid(), name, email, password };
        saveUser(user);

        // auto login: create session token
        const token = { token: uid(), userId: user.id, email: user.email, createdAt: Date.now() };
        setSession(token);
        showToast('Account created. Redirecting to dashboard...', 'success');
        setTimeout(() => redirect('/dashboard'), 800);
      });
    }

    // LOGIN
    const loginForm = el('login-form');
    if (loginForm) {
      el('login-btn').addEventListener('click', () => {
        const email = el('login-email').value.trim();
        const password = el('login-password').value;

        ['login-email-error','login-password-error'].forEach(id => { if(el(id)){ el(id).classList.add('hidden'); el(id).textContent = ''; } });

        if (!email) { el('login-email-error').textContent = 'Email required.'; el('login-email-error').classList.remove('hidden'); return; }
        if (!password) { el('login-password-error').textContent = 'Password required.'; el('login-password-error').classList.remove('hidden'); return; }

        const user = findUserByEmail(email);
        if (!user || user.password !== password) {
          showToast('Invalid credentials. Please try again.', 'error');
          return;
        }

        // success
        const token = { token: uid(), userId: user.id, email: user.email, createdAt: Date.now() };
        setSession(token);
        showToast('Login successful — redirecting to dashboard.', 'success');
        setTimeout(() => redirect('/dashboard'), 700);
      });
    }

    // show logout behavior
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearSession();
        showToast('Logged out.', 'success');
        setTimeout(() => redirect('/auth/login'), 400);
      });
    }
  }

  // ----------------------
  // Protected route enforcement (client-side)
  // ----------------------
  function enforceProtection() {
    const protectedPaths = ['/dashboard', '/tickets'];
    const path = window.location.pathname;
    if (protectedPaths.includes(path) && !isAuthenticated()) {
      showToast('Your session has expired — please log in again.', 'error');
      setTimeout(() => redirect('/auth/login'), 600);
    }
    // If on login/signup and already authenticated, go to dashboard
    if ((path === '/auth/login' || path === '/auth/signup') && isAuthenticated()) {
      setTimeout(() => redirect('/dashboard'), 200);
    }
  }

  // ----------------------
  // Dashboard UI update
  // ----------------------
  function updateDashboardStats() {
    const path = window.location.pathname;
    if (path !== '/dashboard') return;
    const tickets = getTickets();
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const closed = tickets.filter(t => t.status === 'closed').length;

    if (el('stat-total')) el('stat-total').textContent = total;
    if (el('stat-open')) el('stat-open').textContent = open;
    if (el('stat-closed')) el('stat-closed').textContent = closed;
  }

  // ----------------------
  // Ticket management UI & CRUD
  // ----------------------
  function ticketsUI() {
    const path = window.location.pathname;
    if (path !== '/tickets') return;

    const ticketsContainer = el('tickets-list');
    const formWrapper = el('ticket-form-wrapper');
    const form = el('ticket-form');
    const createBtn = el('create-ticket-btn');
    const saveBtn = el('ticket-save');
    const cancelBtn = el('ticket-cancel');
    const formTitle = el('form-title');

    function renderList() {
      const tickets = getTickets().sort((a,b) => b.createdAt - a.createdAt);
      ticketsContainer.innerHTML = '';
      if (tickets.length === 0) {
        ticketsContainer.innerHTML = `<div class="bg-white p-6 rounded-lg shadow text-gray-600">No tickets yet. Create one to get started.</div>`;
        updateDashboardStats();
        return;
      }

      tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow flex flex-col justify-between';
        const statusColor = ticket.status === 'open' ? 'status-open' : ticket.status === 'in_progress' ? 'status-in-progress' : 'status-closed';

        card.innerHTML = `
          <div>
            <h3 class="text-lg font-bold text-blue-700">${escapeHtml(ticket.title)}</h3>
            <p class="mt-2 text-gray-600">${escapeHtml(ticket.description || '')}</p>
            <div class="mt-3">
              <span class="inline-block px-3 py-1 rounded-full text-white text-sm ${statusColor === 'status-open' ? 'bg-green-600' : statusColor === 'status-in-progress' ? 'bg-yellow-500' : 'bg-gray-500'}">
                ${ticket.status}
              </span>
            </div>
          </div>
          <div class="mt-4 flex gap-2">
            <button data-id="${ticket.id}" class="edit-ticket bg-blue-600 text-white px-3 py-2 rounded text-sm">Edit</button>
            <button data-id="${ticket.id}" class="delete-ticket bg-red-500 text-white px-3 py-2 rounded text-sm">Delete</button>
          </div>
        `;
        ticketsContainer.appendChild(card);
      });

      // attach handlers
      document.querySelectorAll('.edit-ticket').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          openEditForm(id);
        });
      });

      document.querySelectorAll('.delete-ticket').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          if (confirm('Are you sure you want to delete this ticket?')) {
            deleteTicket(id);
          }
        });
      });

      updateDashboardStats();
    }

    function openCreateForm() {
      formTitle.textContent = 'Create Ticket';
      formWrapper.classList.remove('hidden');
      el('ticket-id').value = '';
      el('ticket-title').value = '';
      el('ticket-status').value = '';
      el('ticket-description').value = '';
    }

    function openEditForm(id) {
      const tickets = getTickets();
      const ticket = tickets.find(t => t.id === id);
      if (!ticket) { showToast('Ticket not found.', 'error'); return; }
      formTitle.textContent = 'Edit Ticket';
      formWrapper.classList.remove('hidden');
      el('ticket-id').value = ticket.id;
      el('ticket-title').value = ticket.title;
      el('ticket-status').value = ticket.status;
      el('ticket-description').value = ticket.description || '';
      // scroll into view
      formWrapper.scrollIntoView({ behavior: 'smooth' });
    }

    function deleteTicket(id) {
      let tickets = getTickets();
      tickets = tickets.filter(t => t.id !== id);
      saveTickets(tickets);
      showToast('Ticket deleted.', 'success');
      renderList();
    }

    function saveForm() {
      const id = el('ticket-id').value;
      const title = el('ticket-title').value.trim();
      const status = el('ticket-status').value;
      const description = el('ticket-description').value.trim();

      // clear previous errors
      ['ticket-title-error','ticket-status-error','ticket-description-error'].forEach(id => {
        const elerr = document.getElementById(id);
        if (elerr) { elerr.classList.add('hidden'); elerr.textContent = ''; }
      });

      const errors = validateTicket({ title, status, description });
      if (Object.keys(errors).length > 0) {
        if (errors.title) { el('ticket-title-error').textContent = errors.title; el('ticket-title-error').classList.remove('hidden'); }
        if (errors.status) { el('ticket-status-error').textContent = errors.status; el('ticket-status-error').classList.remove('hidden'); }
        if (errors.description) { el('ticket-description-error').textContent = errors.description; el('ticket-description-error').classList.remove('hidden'); }
        return;
      }

      const tickets = getTickets();
      if (id) {
        // update
        const idx = tickets.findIndex(t => t.id === id);
        if (idx === -1) { showToast('Ticket not found.', 'error'); return; }
        tickets[idx].title = title;
        tickets[idx].status = status;
        tickets[idx].description = description;
        tickets[idx].updatedAt = Date.now();
        saveTickets(tickets);
        showToast('Ticket updated.', 'success');
      } else {
        // create
        const newTicket = {
          id: uid(),
          title,
          status,
          description,
          createdAt: Date.now()
        };
        tickets.push(newTicket);
        saveTickets(tickets);
        showToast('Ticket created.', 'success');
      }

      formWrapper.classList.add('hidden');
      renderList();
    }

    createBtn.addEventListener('click', openCreateForm);
    cancelBtn.addEventListener('click', () => { formWrapper.classList.add('hidden'); });

    saveBtn.addEventListener('click', saveForm);

    // initial render
    renderList();
  }

  // ----------------------
  // Small helpers
  // ----------------------
  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"'`=\/]/g, function (s) {
      return ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
        "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
      })[s];
    });
  }

  // ----------------------
  // Boot up
  // ----------------------
  function main() {
    updateHeaderUI();
    enforceProtection();
    initAuthForms();
    updateDashboardStats();
    ticketsUI();

    // mobile menu quick handler
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        alert('Mobile menu placeholder. Navigation links are visible on larger screens.');
      });
    }
  }

  // run main after DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
