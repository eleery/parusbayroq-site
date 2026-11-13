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
      alert('Не удалось отправить заявку. Пожалуйста, позвоните нам по номеру +998 97 900 01 33 или попробуйте ещё раз.');
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

// ===== CALCULATOR =====
(function() {

  // ---------- DATA ----------
  const SIZES = {
    parus: [
      { key: 'size_parus_small',    price: 100000 },
      { key: 'size_parus_standard', price: 150000 },
    ],
    rastyajka: [
      { key: 'size_r_s', price: 70000  },
      { key: 'size_r_m', price: 90000  },
      { key: 'size_r_l', price: 110000 },
    ],
    klassika: [
      { key: 'size_k_s', price: 88000  },
      { key: 'size_k_m', price: 100000 },
      { key: 'size_k_l', price: 200000 },
    ],
  };

  // ---------- ELEMENTS ----------
  const selType     = document.getElementById('calc-type');
  const selSize     = document.getElementById('calc-size');
  const selPrint    = document.getElementById('calc-print');
  const selKit      = document.getElementById('calc-kit');
  const kitField    = document.getElementById('calc-kit-field');
  const selDelivery = document.getElementById('calc-delivery');
  const qtyInput    = document.getElementById('qty-input');
  const qtyMinus    = document.getElementById('qty-minus');
  const qtyPlus     = document.getElementById('qty-plus');
  const elPriceNew  = document.getElementById('price-new');
  const elPriceOld  = document.getElementById('price-old');

  if (!selType) return; // calc not on this page

  // ---------- HELPERS ----------
  function fmt(n) {
    return Math.round(n).toLocaleString('ru-RU').replace(/\u202f/g, ' ') + ' сум';
  }

  function getQty() {
    const v = parseInt(qtyInput.value);
    return (isNaN(v) || v < 1) ? 1 : v;
  }

  // ---------- POPULATE SIZES ----------
  function populateSizes(type) {
    selSize.innerHTML = '';
    (SIZES[type] || []).forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.price;
      opt.textContent = (typeof t === 'function') ? t(s.key) : s.key;
      selSize.appendChild(opt);
    });
  }

  // ---------- UPDATE KIT FIELD ----------
  function updateKitField(type) {
    const noKit = (type === 'klassika' || type === 'rastyajka');
    selKit.disabled = noKit;
    kitField.classList.toggle('calc-field--disabled', noKit);
    if (noKit) selKit.value = '0';
  }

  // ---------- CALCULATE ----------
  function calculate() {
    const type     = selType.value;
    const basePrice = parseFloat(selSize.value) || 0;
    const printMult = parseFloat(selPrint.value) || 1;
    const kitCost   = parseFloat(selKit.value) || 0;
    const delivery  = parseFloat(selDelivery.value) || 0;
    const qty       = getQty();

    // Flag price per unit (print multiplier applied to flag only)
    const flagUnit = basePrice * printMult;

    // Kit per unit
    const kitUnit = kitCost; // 0 or 300 000

    // Unit total
    const unitTotal = flagUnit + kitUnit;

    // Subtotal before delivery
    const subtotal = unitTotal * qty;

    // Delivery logic
    let deliveryTotal = 0;
    if (delivery > 0) {
      // Base delivery (flat, once)
      deliveryTotal += delivery;

      // If kit selected AND parus — add delivery per each kit
      if (type === 'parus' && kitCost > 0) {
        deliveryTotal += delivery * qty;
      }
    }

    const rawTotal = subtotal + deliveryTotal;
    if (rawTotal <= 0) return;

    // Final prices
    const priceWithDiscount    = rawTotal - 20000;          // цена со скидкой
    const priceWithoutDiscount = priceWithDiscount * 1.2;   // цена без скидки

    animatePrice(elPriceNew, fmt(priceWithDiscount));
    animatePrice(elPriceOld, fmt(priceWithoutDiscount));
  }

  // ---------- ANIMATE PRICE ----------
  function animatePrice(el, newText) {
    if (el.textContent === newText) return;
    el.classList.add('price-updating');
    setTimeout(() => {
      el.textContent = newText;
      el.classList.remove('price-updating');
    }, 200);
  }

  // ---------- ON TYPE CHANGE ----------
  function onTypeChange() {
    const type = selType.value;
    populateSizes(type);
    updateKitField(type);
    calculate();
  }

  // Expose for language switch
  window.repopulateCalcSizes = onTypeChange;

  // ---------- QTY CONTROLS ----------
  qtyMinus.addEventListener('click', () => {
    const v = getQty();
    if (v > 1) { qtyInput.value = v - 1; calculate(); }
  });
  qtyPlus.addEventListener('click', () => {
    qtyInput.value = getQty() + 1;
    calculate();
  });
  qtyInput.addEventListener('input', () => {
    if (qtyInput.value < 1 || qtyInput.value === '') qtyInput.value = 1;
    calculate();
  });

  // ---------- SELECT LISTENERS ----------
  selType.addEventListener('change', onTypeChange);
  selSize.addEventListener('change', calculate);
  selPrint.addEventListener('change', calculate);
  selKit.addEventListener('change', calculate);
  selDelivery.addEventListener('change', calculate);

  // ---------- INIT ----------
  onTypeChange();

})();

// ===== CALCULATOR #2 (top section) =====
(function() {
  const SIZES = {
    parus:    [{ key:'size_parus_small', price: 100000 }, { key:'size_parus_standard', price: 150000 }],
    rastyajka:[{ key:'size_r_s', price: 70000 }, { key:'size_r_m', price: 90000 }, { key:'size_r_l', price: 110000 }],
    klassika: [{ key:'size_k_s', price: 88000 }, { key:'size_k_m', price: 100000 }, { key:'size_k_l', price: 200000 }],
  };
  const s = (id) => document.getElementById(id);
  const selType=s('calc-type2'), selSize=s('calc-size2'), selPrint=s('calc-print2');
  const selKit=s('calc-kit2'), kitField=s('calc-kit-field2');
  const selDelivery=s('calc-delivery2'), qtyInput=s('qty-input2');
  const qtyMinus=s('qty-minus2'), qtyPlus=s('qty-plus2');
  const elNew=s('price-new2'), elOld=s('price-old2');
  if (!selType) return;
  function fmt(n) { return Math.round(n).toLocaleString('ru-RU').replace(/\u202f/g,' ') + ' сум'; }
  function getQty() { const v=parseInt(qtyInput.value); return (isNaN(v)||v<1)?1:v; }
  function populateSizes(type) {
    selSize.innerHTML='';
    (SIZES[type]||[]).forEach(s=>{ const o=document.createElement('option'); o.value=s.price; o.textContent=(typeof t==='function'?t(s.key):s.key); selSize.appendChild(o); });
  }
  function updateKit(type) {
    const noKit=(type==='klassika'||type==='rastyajka');
    selKit.disabled=noKit; kitField.classList.toggle('calc-field--disabled',noKit);
    if(noKit) selKit.value='0';
  }
  function calculate() {
    const type=selType.value, base=parseFloat(selSize.value)||0;
    const print=parseFloat(selPrint.value)||1, kit=parseFloat(selKit.value)||0;
    const delivery=parseFloat(selDelivery.value)||0, qty=getQty();
    const unit=base*print+kit, subtotal=unit*qty;
    let delTotal=0;
    if(delivery>0){ delTotal+=delivery; if(type==='parus'&&kit>0) delTotal+=delivery*qty; }
    const raw=subtotal+delTotal;
    if(raw<=0) return;
    const discounted=raw-20000, original=discounted*1.2;
    animPrice(elNew,fmt(discounted)); animPrice(elOld,fmt(original));
  }
  function animPrice(el,txt) {
    if(el.textContent===txt) return;
    el.classList.add('price-updating');
    setTimeout(()=>{ el.textContent=txt; el.classList.remove('price-updating'); },200);
  }
  function onType() { populateSizes(selType.value); updateKit(selType.value); calculate(); }
  // Chain into global repopulate
  const _prev = window.repopulateCalcSizes;
  window.repopulateCalcSizes = function() { if(_prev) _prev(); onType(); };
  qtyMinus.addEventListener('click',()=>{ if(getQty()>1){qtyInput.value=getQty()-1;calculate();} });
  qtyPlus.addEventListener('click',()=>{ qtyInput.value=getQty()+1; calculate(); });
  qtyInput.addEventListener('input',()=>{ if(qtyInput.value<1)qtyInput.value=1; calculate(); });
  selType.addEventListener('change',onType);
  selSize.addEventListener('change',calculate);
  selPrint.addEventListener('change',calculate);
  selKit.addEventListener('change',calculate);
  selDelivery.addEventListener('change',calculate);
  onType();
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
    button.textContent = 'Отправляем…';

    const sent = await submitQuestionForm({ name, phone, message });
    if (sent) {
      nameInput.value = '';
      phoneInput.value = '+998 ';
      if (messageInput) messageInput.value = '';
      button.textContent = 'Отправлено ✓';
      setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText;
      }, 2500);
      if (typeof gtag_report_conversion === 'function') gtag_report_conversion();
    } else {
      button.disabled = false;
      button.textContent = originalText;
      alert('Не удалось отправить вопрос. Пожалуйста, позвоните нам по номеру +998 97 900 01 33 или попробуйте ещё раз.');
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

  // Show first frame immediately
  video.load();

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
