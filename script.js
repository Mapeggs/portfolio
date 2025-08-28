document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.main-nav a[href^="#"]');
  const pages = document.querySelectorAll('.page');

  function setActiveLink(hash) {
    const current = hash || '#about';
    links.forEach(a => {
      const isActive = a.getAttribute('href') === current;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function showSection(hash) {
    const id = hash || '#about';
    const target = document.querySelector(id);

    // Hide all pages, show the target one
    pages.forEach(p => p.classList.remove('active'));
    if (target && target.classList.contains('page')) {
      target.classList.add('active');
    }

    // Update nav highlight and URL (no scroll jump)
    setActiveLink(id);
    if (location.hash !== id) history.replaceState(null, '', id);
  }

  // Click handlers
  links.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(a.getAttribute('href'));
    });
  });

  // Respond to manual hash changes
  window.addEventListener('hashchange', () => showSection(location.hash));

  // Initial render
  showSection(location.hash);
});


// ===== Modal for project details =====
(function () {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const content = modal.querySelector('.modal__content');
  const closeBtn = modal.querySelector('.modal__close');

  function openModalFromTemplateId(selector) {
    const tpl = document.querySelector(selector);
    if (!tpl) return;
    content.innerHTML = '';
    content.appendChild(tpl.content.cloneNode(true));
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    // trap focus to modal
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    content.innerHTML = '';
  }

  // Open on image-card click/enter
  document.querySelectorAll('.image-card').forEach(card => {
    const selector = card.getAttribute('data-detail');
    card.addEventListener('click', () => openModalFromTemplateId(selector));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModalFromTemplateId(selector);
      }
    });
  });

  // Close interactions
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();

// ===== Sub-nav (tabs) inside Projects =====
(function () {
  const tabButtons = document.querySelectorAll('.projects-subnav .subnav-link');
  const galleries  = document.querySelectorAll('.projects-grid.gallery');

  if (!tabButtons.length || !galleries.length) return;

  function showGallery(id) {
    galleries.forEach(g => { g.hidden = (g.id !== id); });
    tabButtons.forEach(btn => {
      const active = btn.dataset.target === id;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => showGallery(btn.dataset.target));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showGallery(btn.dataset.target); }
    });
  });

  // Default to Games
  showGallery('gallery-games');
})();
