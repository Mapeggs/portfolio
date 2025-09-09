document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.main-nav a[href^="#"]');
  const pages = document.querySelectorAll('.page');

  // --- Mini-pages under #projects ---
  function normalizeHash(h) {
    if (!h) return '#about';
    // Turn "#projects/games" into "#projects" when choosing the section
    const base = h.split('/')[0];
    return base || '#about';
  }

  function currentProjectsView() {
    const h = location.hash;
    if (!h.startsWith('#projects')) return null;
    if (h.startsWith('#projects/designs')) return 'gallery-designs';
    return 'gallery-games'; // default
  }

  function setActiveLink(hash) {
    const current = normalizeHash(hash);
    links.forEach(a => {
      const isActive = a.getAttribute('href') === current;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function showSection(hash) {
    const id = normalizeHash(hash);
    const target = document.querySelector(id);

    // Hide all pages, show target
    pages.forEach(p => p.classList.remove('active'));
    if (target && target.classList.contains('page')) {
      target.classList.add('active');
    }

    // Keep nav highlighting + full hash (incl. /games or /designs)
    setActiveLink(hash);
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }

  // Top nav
  links.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(a.getAttribute('href'));
    });
  });

  // Hash changes (Back/Forward or manual edits)
  window.addEventListener('hashchange', () => {
    showSection(location.hash);
    syncProjectsFromHash();
  });

  // Keep Projects sub-view synced with hash
  function syncProjectsFromHash() {
    const view = currentProjectsView();
    if (view) {
      // Switch gallery + aria states
      const tab = document.querySelector(`.projects-subnav .subnav-link[data-target="${view}"]`);
      if (tab) {
        window.showGallery(view);
        document.querySelectorAll('.projects-subnav .subnav-link').forEach(el => {
          const active = el === tab;
          el.classList.toggle('active', active);
          el.setAttribute('aria-selected', active ? 'true' : 'false');
        });
      }
    }
  }

  // Initial render (default to Projects → Games)
  showSection(location.hash || '#about');
  syncProjectsFromHash();
});


// ===== Modal for project details (fixed: no duplicate closeBtn) =====
(function () {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const content  = modal.querySelector('.modal__content');
  const closeBtn = modal.querySelector('.modal__close'); // <— defined ONCE

  function openModalFromTemplateId(selector) {
    const tpl = document.querySelector(selector);
    if (!tpl) return;
    content.innerHTML = '';
    content.appendChild(tpl.content.cloneNode(true));
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    content.innerHTML = '';
  }

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.image-card');
    if (card && card.dataset.detail) {
      e.preventDefault();
      openModalFromTemplateId(card.dataset.detail);
    }
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
})();


// ===== Sub-nav (Games / Designs) deep-linked tabs =====
(function () {
  const tabButtons = document.querySelectorAll('.projects-subnav .subnav-link');
  const galleries  = document.querySelectorAll('.projects-grid.gallery');
  if (!tabButtons.length || !galleries.length) return;

  // Expose so the other block can call it
  window.showGallery = function (id) {
    galleries.forEach(g => { g.hidden = (g.id !== id); });
    tabButtons.forEach(btn => {
      const active = btn.dataset.target === id;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const hash = btn.getAttribute('href');       // #projects/games or #projects/designs
      if (hash) location.hash = hash;              // updates URL + history
      window.showGallery(btn.dataset.target);      // update view immediately
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const hash = btn.getAttribute('href');
        if (hash) location.hash = hash;
        window.showGallery(btn.dataset.target);
      }
    });
  });

  // Set initial tab from the current hash
  const initial = location.hash.startsWith('#projects/designs') ? 'gallery-designs' : 'gallery-games';
  window.showGallery(initial);


  // Utility: show/hide helper for the modal image block
function setModalImage(modal, src, altText) {
  const media = modal.querySelector('.modal__media');
  const img   = modal.querySelector('.modal__image');

  if (src) {
    img.src = src;
    img.alt = altText || '';
    media.style.display = '';
  } else {
    // no image for this item → hide media block
    img.removeAttribute('src');
    img.alt = '';
    media.style.display = 'none';
  }
}

// Attach once after DOMContentLoaded
document.addEventListener('click', (e) => {
  const card = e.target.closest('.project-card');
  if (!card) return;

  const modal = document.querySelector('#projectModal');
  if (!modal) return;

  // Pull data from the card
  const title = card.dataset.title || card.querySelector('h3')?.textContent || 'Untitled';
  const desc  = card.dataset.desc  || '';
  const image = card.dataset.image || card.querySelector('img')?.src || '';
  const link  = card.dataset.link  || '';

  // Fill modal fields
  modal.querySelector('.modal__title').textContent = title;
  modal.querySelector('.modal__desc').textContent  = desc;

  // NEW: set image
  setModalImage(modal, image, title);

  // Optional: CTA
  const cta = modal.querySelector('.modal__cta');
  if (cta) {
    if (link) {
      cta.href = link;
      cta.style.display = '';
    } else {
      cta.removeAttribute('href');
      cta.style.display = 'none';
    }
  }

  // Open the modal (use your existing open logic if you have it)
  document.body.classList.add('modal-open');
  modal.setAttribute('aria-hidden', 'false');
});

// Close button (keep your existing logic if present)
document.addEventListener('click', (e) => {
  if (e.target.matches('.modal__close') || e.target.closest('.modal__close')) {
    const modal = document.querySelector('#projectModal');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
});
})();
