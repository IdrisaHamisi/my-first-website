
  let isAnnual = false;

  function togglePricing() {
    isAnnual = !isAnnual;
    applyPricing();
  }

  function setPricing(mode) {
    isAnnual = mode === 'annual';
    applyPricing();
  }

  function applyPricing() {
    const toggle = document.getElementById('billingToggle');
    const monthlyLabel = document.getElementById('monthly-label');
    const annualLabel  = document.getElementById('annual-label');
    const saveBadge    = document.getElementById('save-badge');

    toggle.classList.toggle('annual', isAnnual);
    toggle.setAttribute('aria-checked', isAnnual ? 'true' : 'false');
    monthlyLabel.classList.toggle('active', !isAnnual);
    annualLabel.classList.toggle('active', isAnnual);
    saveBadge.style.opacity = isAnnual ? '1' : '0';

    const key = isAnnual ? 'annual' : 'monthly';

    document.querySelectorAll('.price-val').forEach(el => {
      el.textContent = el.dataset[key] || el.textContent;
    });

    document.querySelectorAll('.plan-period').forEach((el, i) => {
      if (i < 2) {
        el.textContent = isAnnual
          ? '/ month | billed annually'
          : '/ month | billed monthly';
      }
    });
  }

  // Bento hover keyboard accessibility
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        card.style.transform = 'translateY(-4px)';
        setTimeout(() => card.style.transform = '', 200);
      }
    });
  });

  // ── INTERNAL ARTICLE PUBLISHER: drag & drop + submit ──
  (function () {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('coverImageInput');
    const filenameEl = document.getElementById('dropzoneFilename');
    const form = document.getElementById('articleForm');
    const publishSuccess = document.getElementById('publishSuccess');
    const publishStatus = document.getElementById('publishStatus');

    if (!dropzone || !fileInput || !form) return;

    function showFile(file) {
      if (!file) return;
      dropzone.classList.add('has-file');
      filenameEl.textContent = '✓ ' + file.name;
    }

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) showFile(fileInput.files[0]);
    });

    ['dragenter', 'dragover'].forEach(evt => {
      dropzone.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      dropzone.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', e => {
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        fileInput.files = files;
        showFile(files[0]);
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      publishSuccess.classList.add('show');
      publishStatus.textContent = 'Submitted ' + new Date().toLocaleString();
      setTimeout(() => publishSuccess.classList.remove('show'), 4000);
    });
  })();

  // ── SUBSCRIBE TO PUBLICATIONS ──
  (function () {
    const form = document.getElementById('subscribeForm');
    const emailInput = document.getElementById('subscribeEmail');
    const status = document.getElementById('subscribeStatus');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      status.textContent = `Thank you — ${emailInput.value} has been subscribed to our publications.`;
      form.reset();
    });
  })();

  // ── SHOW CONTACT INFO INLINE (no navigating away) ──
  (function () {
    const toast = document.getElementById('contactToast');
    if (!toast) return;
    let hideTimer;

    function showToast(html) {
      toast.innerHTML = html;
      toast.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => toast.classList.remove('show'), 3500);
    }

    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => {});
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(ta);
      }
    }

    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const email = decodeURIComponent(link.getAttribute('href').replace('mailto:', '').split('?')[0]);
        copyText(email);
        showToast('✉️ Email us at <strong>' + email + '</strong> — copied to clipboard');
      });
    });

    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const phone = link.getAttribute('href').replace('tel:', '');
        copyText(phone);
        showToast('📞 Call us on <strong>' + phone + '</strong> — copied to clipboard');
      });
    });
  })();

  // ── VISITOR COUNTER ──
  // Uses the free CountAPI service to keep one real, shared count across all
  // visitors to the live site (no backend of your own required). Falls back
  // to a per-browser count via localStorage if the request fails (e.g. no
  // network, or the file is opened locally instead of hosted).
  (function () {
    const countEl = document.getElementById('visitorCount');
    if (!countEl) return;

    fetch('https://api.countapi.xyz/hit/kazilawoffice.co.tz/site-visits')
      .then(res => res.json())
      .then(data => {
        countEl.textContent = Number(data.value).toLocaleString();
      })
      .catch(() => {
        try {
          const key = 'kazilaw_visit_count';
          const current = parseInt(localStorage.getItem(key) || '0', 10) + 1;
          localStorage.setItem(key, current);
          countEl.textContent = current.toLocaleString();
        } catch (err) {
          countEl.textContent = '—';
        }
      });
  })();