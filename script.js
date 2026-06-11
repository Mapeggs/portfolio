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
    if (h === '#designs' || h.startsWith('#projects/designs')) return 'gallery-designs';
    if (h === '#hacks' || h.startsWith('#projects/hacks')) return 'gallery-hacks';
    if (h === '#games' || h.startsWith('#projects/games')) return 'gallery-games';
    return null;
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

    // Hide all pages, show target. This portfolio now uses separate HTML pages,
    // so only run the old single-page behavior when .page sections exist.
    if (pages.length) {
      pages.forEach(p => p.classList.remove('active'));
      if (target && target.classList.contains('page')) {
        target.classList.add('active');
        setActiveLink(hash);
        if (location.hash !== hash) history.replaceState(null, '', hash);
      }
    }
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
    const detailTrigger = e.target.closest('[data-open-detail]');
    if (detailTrigger) {
      e.preventDefault();
      const galleryId = detailTrigger.dataset.openGallery;
      if (galleryId && typeof window.showGallery === 'function') {
        window.showGallery(galleryId);
        const galleryHashes = {
          'gallery-designs': '#designs',
          'gallery-hacks': '#hacks',
          'gallery-games': '#games'
        };
        history.replaceState(null, '', galleryHashes[galleryId] || '#games');
      }
      openModalFromTemplateId(detailTrigger.dataset.openDetail);
      return;
    }

    const card = e.target.closest('.image-card');
    if (card && card.dataset.detail) {
      e.preventDefault();
      openModalFromTemplateId(card.dataset.detail);
    }
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.body.classList.contains('media-lightbox-open')) closeModal();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
})();


// ===== Sub-nav (Games / Artwork / Hacks) deep-linked tabs =====
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
  let initial = 'gallery-games';
  if (location.hash === '#designs' || location.hash.startsWith('#projects/designs')) initial = 'gallery-designs';
  if (location.hash === '#hacks' || location.hash.startsWith('#projects/hacks')) initial = 'gallery-hacks';
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


// ===== Hack project screenshot carousel =====
(function () {
  function getParts(carousel) {
    return {
      viewport: carousel.querySelector('.hack-carousel__viewport'),
      slides: Array.from(carousel.querySelectorAll('.hack-carousel__slide')),
      dots: Array.from(carousel.querySelectorAll('.hack-carousel__dot'))
    };
  }

  function setActiveDot(carousel, index) {
    const { dots } = getParts(carousel);
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  function currentIndex(carousel) {
    const { viewport, slides } = getParts(carousel);
    if (!viewport || !slides.length) return 0;
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let bestIndex = 0;
    let bestDistance = Infinity;
    slides.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(center - slideCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    });
    return bestIndex;
  }

  function scrollToSlide(carousel, index) {
    const { viewport, slides } = getParts(carousel);
    if (!viewport || !slides[index]) return;
    viewport.scrollTo({
      left: slides[index].offsetLeft - 10,
      behavior: 'smooth'
    });
    setActiveDot(carousel, index);
  }

  document.addEventListener('click', (e) => {
    const directionBtn = e.target.closest('[data-carousel-direction]');
    if (directionBtn) {
      e.preventDefault();
      const carousel = directionBtn.closest('[data-carousel]');
      if (!carousel) return;
      const { slides } = getParts(carousel);
      if (!slides.length) return;
      const direction = directionBtn.dataset.carouselDirection === 'next' ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(slides.length - 1, currentIndex(carousel) + direction));
      scrollToSlide(carousel, nextIndex);
      return;
    }

    const dot = e.target.closest('[data-carousel-dot]');
    if (dot) {
      e.preventDefault();
      const carousel = dot.closest('[data-carousel]');
      const index = Number.parseInt(dot.dataset.carouselDot, 10);
      if (carousel && Number.isInteger(index)) scrollToSlide(carousel, index);
    }
  });

  let scrollTimer;
  document.addEventListener('scroll', (e) => {
    const viewport = e.target.closest?.('.hack-carousel__viewport');
    if (!viewport) return;
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const carousel = viewport.closest('[data-carousel]');
      if (carousel) setActiveDot(carousel, currentIndex(carousel));
    }, 80);
  }, true);
})();


// ===== Enlarged animation viewer =====
(function () {
  const lightbox = document.getElementById('mediaLightbox');
  if (!lightbox) return;

  const video = lightbox.querySelector('.media-lightbox__video');
  const title = lightbox.querySelector('.media-lightbox__title');
  const closeBtn = lightbox.querySelector('.media-lightbox__close');

  function openLightbox(src, label) {
    if (!src || !video) return;

    video.src = src;
    video.load();
    video.play().catch(() => {
      // Browsers may block autoplay in some cases; controls remain available.
    });

    if (title) title.textContent = label || 'Animation Preview';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('media-lightbox-open');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('media-lightbox-open');

    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  }

  document.addEventListener('click', (e) => {
    const zoomTrigger = e.target.closest('[data-zoom-src]');
    if (zoomTrigger) {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(zoomTrigger.dataset.zoomSrc, zoomTrigger.dataset.zoomTitle);
      return;
    }

    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeLightbox();
    }
  }, true);

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
})();
