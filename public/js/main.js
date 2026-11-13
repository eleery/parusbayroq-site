// Scroll to order calculator
const scrollToOrderBtn = document.getElementById('scroll-to-order');
if (scrollToOrderBtn) {
  scrollToOrderBtn.addEventListener('click', () => {
    const target = document.getElementById('order');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// Burger menu
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
if (burger && nav) {
  burger.addEventListener('click', () => nav.classList.toggle('nav--open'));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) nav.classList.remove('nav--open');
  });
}

// FAQ accordion — smooth animation
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    const wasOpen = item.classList.contains('faq-item--open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('faq-item--open'));
    if (!wasOpen) item.classList.add('faq-item--open');
  });
});

// Qty buttons handled by calculator below

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); nav.classList.remove('nav--open'); }
  });
});

// Header shadow
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 20 ? '0 2px 20px rgba(0,0,0,0.08)' : 'none';
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.why__item, .type-card, .adv-item, .print-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ===== MODAL =====
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');
const modalForm    = document.getElementById('modal-form');
const modalBody    = document.getElementById('modal-body');
const modalSuccess = document.getElementById('modal-success');
const successClose = document.getElementById('modal-success-close');

function openModal(titleKey) {
  modalBody.style.display = 'block';
  modalSuccess.classList.remove('modal__success--show');
  modalForm.reset();

  // Set dynamic title
  const modalTitleEl = document.getElementById('modal-title');
  if (modalTitleEl) {
    const titles = TRANSLATIONS[currentLang]?.modal_titles || TRANSLATIONS['ru'].modal_titles;
    let title = TRANSLATIONS[currentLang]?.modal_default_title || 'Оставить заявку';
    if (titleKey) {
      // titleKey can be a translation key like 'hero_cta' — get the translated text, then look up modal title
      const btnText = t(titleKey);
      title = titles[btnText] || titles[TRANSLATIONS['ru'][titleKey]] || title;
    }
    modalTitleEl.textContent = title;
  }

  modalOverlay.classList.add('modal--open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('modal--open');
  document.body.style.overflow = '';
}

// Trigger buttons
document.querySelectorAll('[data-modal]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const key = btn.getAttribute('data-modal-key') || null;
    openModal(key);
  });
});

// Close on X button
if (modalClose) modalClose.addEventListener('click', closeModal);

// Close on overlay click
if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Close on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Form submit
if (modalForm) {
  modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = document.getElementById('modal-name').value.trim();
    const phone   = document.getElementById('modal-phone').value.trim();
    const comment = document.getElementById('modal-comment').value.trim();
    const title   = document.getElementById('modal-title')?.textContent || 'Заявка';

    if (!name || !phone) {
      if (!name)  document.getElementById('modal-name').style.borderColor  = '#f97316';
      if (!phone) document.getElementById('modal-phone').style.borderColor = '#f97316';
      return;
    }

    // Отправка в Telegram. Для калькулятора отправляем одну расширенную заявку,
    // для остальных кнопок — обычную заявку.
    const activeBtn = document.querySelector('[data-modal][data-last-clicked]');
    let sent = false;
    if (activeBtn && activeBtn._calcData) {
      sent = await submitCalcForm({ ...activeBtn._calcData, name, phone });
    } else {
      sent = await submitModalForm({ title, name, phone, comment });
    }

    if (!sent) {
      alert(t('js_send_error'));
      return;
    }

    // Данные калькулятора очищаем только после подтверждённой отправки,
    // чтобы при повторной попытке заявка снова ушла как калькуляторная.
    if (activeBtn) delete activeBtn._calcData;

    // Show success only after confirmed Telegram delivery
    modalBody.style.display = 'none';
    modalSuccess.classList.add('modal__success--show');
    gtag_report_conversion();
  });
}

// Reset border on input
['modal-name','modal-phone'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => el.style.borderColor = '');
});

// Phone mask: +998 XX XXX XX XX
(function() {
  function applyPhoneMask(input) {
    input.addEventListener('input', function() {
      let digits = this.value.replace(/\D/g, '');
      if (digits.startsWith('998')) digits = digits.slice(3);
      digits = digits.slice(0, 9);
      let formatted = '+998';
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
      if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
      if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
      if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
      this.value = formatted;
    });
    input.addEventListener('keydown', function(e) {
      if ((e.key === 'Backspace' || e.key === 'Delete') && this.value.length <= 4) {
        e.preventDefault();
      }
    });
    input.addEventListener('focus', function() {
      if (!this.value.startsWith('+998')) this.value = '+998 ';
    });
  }
  document.querySelectorAll('input[type="tel"]').forEach(applyPhoneMask);
})();

// Success close
if (successClose) successClose.addEventListener('click', closeModal);

// ===== REVIEWS SLIDER =====
(function() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const track   = document.getElementById('reviews-track');
  if (!prevBtn || !nextBtn || !track) return;

  function scrollByCard(dir) {
    const card = track.querySelector('.review-wrap');
    if (!card) return;
    const gap = 20;
    const cardW = card.offsetWidth + gap;
    track.scrollBy({ left: dir * cardW, behavior: 'smooth' });
  }

  prevBtn.addEventListener('click', () => scrollByCard(-1));
  nextBtn.addEventListener('click', () => scrollByCard(1));
})();

// ===== CALCULATORS =====
// Both calculators on the homepage share this code. Prices and rules come from window.PB_CALC,
// generated at build time from src/lib/prices.mjs (one source of truth with the price table).
(function () {
  const C = window.PB_CALC;
  if (!C) return;
  const num = (n) => Math.round(n).toLocaleString('ru-RU').replace(/[  ]/g, ' ');
  const money = (n) => num(n) + ' ' + t('js_currency');

  function initCalc(sfx) {
    const el = (id) => document.getElementById(id + sfx);
    const selType = el('calc-type'), selSize = el('calc-size'), selPrint = el('calc-print');
    const selKit = el('calc-kit'), kitField = el('calc-kit-field'), selDelivery = el('calc-delivery');
    const qtyInput = el('qty-input'), qtyMinus = el('qty-minus'), qtyPlus = el('qty-plus');
    const elNew = el('price-new'), elOld = el('price-old');
    if (!selType || !selSize || !elNew) return;

    const qty = () => { const v = parseInt(qtyInput.value, 10); return isNaN(v) || v < 1 ? 1 : v; };
    const type = () => C.types[selType.value] || C.types.parus;
    const withKit = () => type().kit > 0 && selKit && selKit.value === 'with';

    function populateSizes() {
      selSize.innerHTML = '';
      type().sizes.forEach((s, i) => {
        const o = document.createElement('option');
        o.value = String(i);
        o.textContent = s.code + ' — ' + s.size + ' ' + t('js_cm');
        selSize.appendChild(o);
      });
      // Classic and stretch flags have no construction: hide the choice completely.
      if (kitField) kitField.style.display = type().kit > 0 ? '' : 'none';
    }

    function deliveryLabels() {
      if (!selDelivery) return;
      [...selDelivery.options].forEach((o) => {
        if (o.value === 'none') return;
        if (!o.dataset.base) o.dataset.base = o.textContent;
        const amount = withKit() ? C.delivery.kit[o.value] : C.delivery.flat[o.value];
        o.textContent = o.dataset.base + ' ≈ ' + num(amount) + (withKit() ? ' ' + t('js_per_item') : '');
      });
    }

    function deliveryCost() {
      const d = selDelivery ? selDelivery.value : 'none';
      if (d === 'none') return 0;
      return withKit() ? C.delivery.kit[d] * qty() : C.delivery.flat[d];
    }

    function calculate() {
      const tp = type();
      const size = tp.sizes[parseInt(selSize.value, 10)] || tp.sizes[0];
      const canvas = size.price - tp.kit;                      // table price includes construction for sail/feather
      const printMult = selPrint && selPrint.value === 'double' ? 2 : 1;
      const kit = withKit() ? tp.kit : 0;
      const goods = (canvas * printMult + kit) * qty();
      const delivery = deliveryCost();
      const before = Math.round(goods / (1 - C.discount) / 500) * 500;
      deliveryLabels();
      // Totals never carry "≈": only the delivery option shows that the delivery cost is approximate.
      animate(elNew, money(goods + delivery));
      if (elOld) animate(elOld, money(before + delivery));
    }

    function animate(node, text) {
      if (node.textContent === text) return;
      node.classList.add('price-updating');
      setTimeout(() => { node.textContent = text; node.classList.remove('price-updating'); }, 200);
    }

    function onType() { populateSizes(); calculate(); }

    if (qtyMinus) qtyMinus.addEventListener('click', () => { if (qty() > 1) { qtyInput.value = qty() - 1; calculate(); } });
    if (qtyPlus) qtyPlus.addEventListener('click', () => { qtyInput.value = qty() + 1; calculate(); });
    if (qtyInput) qtyInput.addEventListener('input', () => { if (qtyInput.value !== '' && qtyInput.value < 1) qtyInput.value = 1; calculate(); });
    selType.addEventListener('change', onType);
    [selSize, selPrint, selKit, selDelivery].forEach((s) => s && s.addEventListener('change', calculate));
    onType();
  }

  initCalc('');
  initCalc('2');
})();

// ===== VIDEO MODAL =====
function openVideoModal() {
  const modal = document.getElementById('video-modal');
  const video = document.getElementById('install-video');
  if (!modal || !video) return;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  video.play().catch(() => {});
}

function closeVideoModal(event, force) {
  const modal = document.getElementById('video-modal');
  const video = document.getElementById('install-video');
  if (!modal || !video) return;
  // Close only if clicking backdrop (not inner content) or force=true
  if (force || (event && event.target === modal)) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    video.pause();
    video.currentTime = 0;
  }
}

// Escape key closes video modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeVideoModal(null, true);
});

// ===== CALC ORDER BUTTONS → MODAL + TELEGRAM =====
// Кнопки "Заказать сейчас" в калькуляторах открывают модал
// и при submit отправляют данные + параметры калькулятора

function getCalcData(suffix) {
  const s = suffix || '';
  const selType     = document.getElementById('calc-type'    + s);
  const selSize     = document.getElementById('calc-size'    + s);
  const selPrint    = document.getElementById('calc-print'   + s);
  const selKit      = document.getElementById('calc-kit'     + s);
  const selDelivery = document.getElementById('calc-delivery'+ s);
  const qtyEl       = document.getElementById('qty-input'    + s);
  const priceEl     = document.getElementById('price-new'    + s);

  return {
    flagType: selType     ? selType.options[selType.selectedIndex]?.text         : '—',
    flagSize: selSize     ? selSize.options[selSize.selectedIndex]?.text         : '—',
    print:    selPrint    ? selPrint.options[selPrint.selectedIndex]?.text       : '—',
    kit:      selKit      ? selKit.options[selKit.selectedIndex]?.text           : '—',
    delivery: selDelivery ? selDelivery.options[selDelivery.selectedIndex]?.text : '—',
    qty:      qtyEl    ? qtyEl.value    : '1',
    price:    priceEl  ? priceEl.textContent : '—',
  };
}

// Attach to calc order buttons
document.querySelectorAll('[data-modal-key="calc_order_btn"], [data-modal]').forEach(btn => {
  if (!btn.closest('.fullcalc-section, .calc-section')) return;
  btn.addEventListener('click', (e) => {
    // Determine which calc this button belongs to (suffix '' or '2')
    const section = btn.closest('section');
    const suffix  = section && section.querySelector('#calc-type2') ? '2' : '';
    // Store calc data for later use when form is submitted
    btn._calcData = getCalcData(suffix);
  });
});

// Track last clicked modal button
document.querySelectorAll('[data-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-last-clicked]').forEach(b => b.removeAttribute('data-last-clicked'));
    btn.setAttribute('data-last-clicked', '1');
  });
});


// ===== FAQ CONTACT FORM =====
(function() {
  const box = document.querySelector('.faq__contact');
  if (!box) return;

  const inputs = box.querySelectorAll('.contact-input');
  const nameInput = inputs[0];
  const phoneInput = inputs[1];
  const messageInput = box.querySelector('.contact-textarea');
  const button = box.querySelector('.contact-submit-row .btn');
  if (!nameInput || !phoneInput || !button) return;

  button.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const message = messageInput ? messageInput.value.trim() : '';

    nameInput.style.borderColor = '';
    phoneInput.style.borderColor = '';
    if (!name || !phone || phone.replace(/\D/g, '').length < 12) {
      if (!name) nameInput.style.borderColor = '#f97316';
      if (!phone || phone.replace(/\D/g, '').length < 12) phoneInput.style.borderColor = '#f97316';
      return;
    }

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = t('js_sending');

    const sent = await submitQuestionForm({ name, phone, message });
    if (sent) {
      nameInput.value = '';
      phoneInput.value = '+998 ';
      if (messageInput) messageInput.value = '';
      button.textContent = t('js_sent');
      setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText;
      }, 2500);
      if (typeof gtag_report_conversion === 'function') gtag_report_conversion();
    } else {
      button.disabled = false;
      button.textContent = originalText;
      alert(t('js_send_error'));
    }
  });
})();

// ===== WORKS SLIDER =====
(function() {
  const prev  = document.getElementById('works-prev');
  const next  = document.getElementById('works-next');
  const track = document.getElementById('works-track');
  if (!prev || !next || !track) return;

  function scrollByCard(dir) {
    const card = track.querySelector('.uc-photo');
    if (!card) return;
    track.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: 'smooth' });
  }

  prev.addEventListener('click', () => scrollByCard(-1));
  next.addEventListener('click', () => scrollByCard(1));

  // Arrow opacity based on scroll position
  function updateArrows() {
    const atStart = track.scrollLeft <= 4;
    const atEnd   = track.scrollLeft + track.offsetWidth >= track.scrollWidth - 4;
    prev.style.opacity = atStart ? '0.35' : '1';
    prev.style.pointerEvents = atStart ? 'none' : 'auto';
    next.style.opacity = atEnd ? '0.35' : '1';
    next.style.pointerEvents = atEnd ? 'none' : 'auto';
  }
  track.addEventListener('scroll', updateArrows, { passive: true });
  updateArrows();
})();

// ===== WORKS VIDEO CARDS =====
document.querySelectorAll('.uc-has-video').forEach(card => {
  const video = card.querySelector('.uc-video');
  if (!video) return;


  card.addEventListener('click', () => {
    const isPlaying = card.classList.contains('playing');

    // Stop all other playing videos
    document.querySelectorAll('.uc-has-video.playing').forEach(c => {
      c.classList.remove('playing');
      const v = c.querySelector('.uc-video');
      if (v) { v.pause(); v.currentTime = 0; v.muted = true; }
    });

    if (!isPlaying) {
      card.classList.add('playing');
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        video.play();
      });
    }
  });
});

// ===== Lazy video posters (set when the card gets close to the screen) =====
(function () {
  const vids = document.querySelectorAll('video[data-poster]');
  if (!('IntersectionObserver' in window)) { vids.forEach(v => { v.poster = v.dataset.poster; }); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.poster = e.target.dataset.poster; io.unobserve(e.target);
  }), { rootMargin: '400px' });
  vids.forEach(v => io.observe(v));
})();
