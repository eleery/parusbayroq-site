// Renders the homepage body for one language from the legacy markup (src/legacy/home.html).
// Text comes from the old translation file plus overrides, so search engines get ready HTML in each language.
import { load } from 'cheerio';
import legacy from '../legacy/home.html?raw';
import strings from '../i18n/strings.json' with { type: 'json' };
import manifest from '../media-manifest.json' with { type: 'json' };
import { overrides, alts } from '../i18n/overrides.mjs';
import { SITE, CONTACTS, paths } from './site.mjs';
import { PRICES, DISCOUNT, refPrice, num } from './prices.mjs';


export function dict(lang) {
  return { ...strings.ru, ...overrides.ru, ...(lang === 'ru' ? {} : { ...strings[lang], ...overrides[lang] }) };
}

const TG_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>';
const IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';

export function renderHome(lang) {
  const t = dict(lang);
  const p = paths(lang);
  const $ = load(legacy, { decodeEntities: false }, false);

  // Second calculator gets its own heading (there were two identical H2).
  $('#order h2').first().attr('data-i18n', 'calc2_title');
  // Size table with the owner's sizes and prices (crossed-out = average price at other companies).
  $('.size-table thead th').first().attr('data-i18n', 'size_table_product');
  $('.size-table tbody').html(PRICES.map((p) =>
    `<tr><td class="size-table__name">${p.label[lang]}</td>` +
    p.rows.map(([size, price]) => `<td><span class="sz">${size}</span><s class="price-ref">${num(refPrice(price))}</s><b class="price-now">${num(price)}</b></td>`).join('') +
    '</tr>').join(''));
  $('.size-table-wrap').after(`<p class="price-note"><span class="price-badge">−${Math.round(DISCOUNT * 100)}%</span><span>${t.price_note}</span></p><p class="price-any">${t.price_any}</p>`);

  // Text
  $('[data-i18n]').each((_, el) => { const k = $(el).attr('data-i18n'); if (t[k] != null) $(el).html(t[k]); $(el).removeAttr('data-i18n'); });
  $('[data-i18n-ph]').each((_, el) => { const k = $(el).attr('data-i18n-ph'); if (t[k] != null) $(el).attr('placeholder', t[k]); $(el).removeAttr('data-i18n-ph'); });
  $('[data-i18n-opt]').each((_, el) => { const k = $(el).attr('data-i18n-opt'); if (t[k] != null) $(el).text(t[k]); });

  // A few strings in the old markup had no translation key.
  if (lang === 'uz') {
    const lit = { 'Воспроизвести видео': "Videoni ko'rish", 'Закрыть': 'Yopish', 'Назад': 'Orqaga', 'Вперёд': 'Oldinga', 'Сообщение': 'Xabar', 'Клиент': 'Mijoz', 'Оставить заявку': 'Ariza qoldirish' };
    $('[aria-label],[placeholder],[title]').each((_, el) => {
      for (const a of ['aria-label', 'placeholder', 'title']) { const v = $(el).attr(a); if (v && lit[v.trim()]) $(el).attr(a, lit[v.trim()]); }
    });
    $('*').contents().each((_, n) => { if (n.type === 'text' && lit[n.data.trim()]) n.data = n.data.replace(n.data.trim(), lit[n.data.trim()]); });
  }

  // Headings: H2 -> H3 instead of jumping to H4.
  $('.why__item h4, .type-card h4, .print-card h4').each((_, el) => { el.tagName = 'h3'; el.name = 'h3'; });

  // Language switcher as real links.
  $('#lang-pill').remove();
  $('.lang-btn').each((_, el) => {
    const l = $(el).attr('data-lang');
    $(el).replaceWith(`<a class="lang-btn${l === lang ? ' lang-btn--active' : ''}" href="${paths(l).home}" hreflang="${l}" lang="${l}">${l.toUpperCase()}</a>`);
  });
  $('a.logo').attr('href', p.home);
  $('.header__phone').attr('aria-label', t.aria_call);
  $('#burger').attr('aria-label', t.aria_menu);

  // Images: optimized WebP with dimensions; lazy below the first screen.
  let n = 0;
  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (!src.startsWith('images/')) return;
    const file = src.slice(7), m = manifest[src];
    if (m) { $(el).attr('src', m.src); if (m.width) { $(el).attr('width', m.width); $(el).attr('height', m.height); } }
    const a = alts[lang];
    let alt = a[file];
    if (/^work_\d/.test(file)) alt = a.work(file.match(/\d+/)[0]);
    if (/^review_\d/.test(file)) alt = a.review();
    if (alt) $(el).attr('alt', alt);
    const inHero = $(el).closest('.header, .hero').length > 0;
    $(el).attr('decoding', 'async');
    if (!inHero) $(el).attr('loading', 'lazy');
    n++;
  });
  // Videos: compressed files, no preload, poster frames.
  $('video').each((_, el) => {
    const v = $(el);
    const s = v.attr('src');
    if (s && manifest[s]) { v.attr('src', manifest[s].src); v.attr('data-poster', `/img/${s.slice(7).replace('.mp4', '-poster.webp')}`); }
    v.find('source').each((_, so) => { const ss = $(so).attr('src'); if (manifest[ss]) $(so).attr('src', manifest[ss].src); });
    if (v.attr('poster')?.startsWith('images/')) { v.attr('data-poster', manifest[v.attr('poster')]?.src || v.attr('poster')); v.removeAttr('poster'); }
    v.attr('preload', 'none');
  });

  // Broken template download -> request the template through the form.
  $('a[href="images/Avtopro_2.psd"]').each((_, el) => {
    const cls = $(el).attr('class');
    $(el).replaceWith(`<button class="${cls}" data-modal data-modal-title="modal_default_title">${t.design_download_btn}</button>`);
  });

  // Links to the custom flags page.
  const orderPath = lang === 'ru' ? '/flagi-na-zakaz/' : `/${lang}/bayroq-buyurtma/`;
  $('img[src*="klassika"]').closest('.type-card').append(`<a class="type-more" href="${orderPath}">${t.type_more}</a>`);
  $('.footer__nav').append(`<a href="${orderPath}">${t.footer_order}</a>`);

  // Payment question in FAQ.
  const lastFaq = $('.faq__list .faq-item').last();
  lastFaq.after(`<div class="faq-item"><div class="faq-q">${t.faq_q30}</div><div class="faq-a"><div class="faq-a__inner">${t.faq_a30}</div></div></div>`);

  // Text block with the main search phrases, before FAQ.
  $('#delivery').before(`<section class="seo-section"><div class="container seo__inner"><h2 class="section-title">${t.seo_title}</h2><p>${t.seo_p1}</p><p>${t.seo_p2}</p><p>${t.seo_p3}</p></div></section>`);

  // Contacts: Telegram button next to the call button.
  $('.contacts-cta a[href^="tel:"]').after(`<a href="${CONTACTS.manager}" class="btn btn--tg btn--lg" target="_blank" rel="noopener">${TG_ICON}<span>${t.contacts_tg_btn}</span></a>`);

  // Footer: own social accounts and privacy link.
  $('.footer__socials').html(
    `<a href="${CONTACTS.channel}" class="social-link" target="_blank" rel="noopener" aria-label="${t.footer_channel}">${TG_ICON}</a>` +
    `<a href="${CONTACTS.instagram}" class="social-link" target="_blank" rel="noopener" aria-label="Instagram">${IG_ICON}</a>`
  );
  $('.footer__inner').after(`<div class="container footer__legal"><span>© ${new Date().getFullYear()} Parus Bayroq · ${t.contacts_addr_value} · <a href="tel:${CONTACTS.phone}">${CONTACTS.phoneText}</a></span><a href="${p.privacy}">${t.footer_privacy}</a></div>`);

  // Floating Telegram button.
  $.root().append(`<a href="${CONTACTS.manager}" class="tg-float" target="_blank" rel="noopener" aria-label="${t.contacts_tg_btn}">${TG_ICON}</a>`);

  // FAQ for structured data.
  const faq = $('.faq-item').map((_, el) => ({ q: $(el).find('.faq-q').text().trim(), a: $(el).find('.faq-a__inner').text().trim() })).get();

  // Strings main.js needs at runtime.
  const jsKeys = new Set(Object.keys(t).filter(k => /^(modal_|size_|opt_|js_)/.test(k)));
  $('[data-modal-key],[data-modal-title]').each((_, el) => { jsKeys.add($(el).attr('data-modal-key')); jsKeys.add($(el).attr('data-modal-title')); });
  const jsDict = Object.fromEntries([...jsKeys].filter(Boolean).filter(k => t[k] != null).map(k => [k, t[k]]));

  return { html: $.html(), faq, jsDict, images: n };
}

// Header, footer, request form and Telegram button for other pages, taken from the rendered homepage.
// Menu anchors point back to the homepage; the language switch points to the given alternates.
export function renderChrome(lang, alternates) {
  const { html, jsDict } = renderHome(lang);
  const $ = load(html, { decodeEntities: false }, false);
  const home = paths(lang).home;
  $('header.header a[href^="#"], footer.footer a[href^="#"]').each((_, el) => { $(el).attr('href', home + $(el).attr('href')); });
  $('.lang-btn').each((_, el) => { const l = $(el).attr('hreflang'); if (alternates[l]) $(el).attr('href', alternates[l]); });
  const header = $.html($('header.header'));
  const footer = $.html($('footer.footer'));
  const modal = $.html($('#modal-overlay'));
  const tg = $.html($('.tg-float'));
  return { header, footer, modal, tg, jsDict };
}
