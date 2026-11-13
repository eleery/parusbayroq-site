// Final prices from the owner (2026-11-13), in UZS. The crossed-out price is the reference
// "average price at other companies": ours is 20% lower (owner's claim, prices are from the producer).
export const DISCOUNT = 0.2;
export const PRICES = [
  { key: 'parus', label: { ru: 'Парус', uz: 'Parus' }, rows: [['200×60', 350000], ['220×65', 400000], ['280×70', 450000], ['300×70', 500000]] },
  { key: 'pero', label: { ru: 'Перо', uz: 'Pero' }, rows: [['200×60', 350000], ['220×65', 400000], ['280×70', 450000], ['300×70', 500000]] },
  { key: 'flag', label: { ru: 'Классика', uz: 'Klassika' }, rows: [['100×70', 75000], ['150×100', 120000], ['220×150', 180000], ['300×150', 280000]] },
  { key: 'rastyajka', label: { ru: 'Растяжка', uz: 'Rastyajka' }, rows: [['120×50', 75000], ['150×50', 110000], ['160×60', 150000], ['180×100', 180000]] },
];
export const SIZES = ['XS', 'S', 'M', 'L'];
export const refPrice = (p) => Math.round(p / (1 - DISCOUNT) / 500) * 500;
export const num = (n) => n.toLocaleString('ru-RU').replace(/[  ]/g, ' ');
export const cur = (lang) => (lang === 'ru' ? 'сум' : "so'm");
export const minPrice = (key) => Math.min(...PRICES.find((p) => p.key === key).rows.map((r) => r[1]));
export const maxPrice = (key) => Math.max(...PRICES.find((p) => p.key === key).rows.map((r) => r[1]));

// Calculator rules agreed with the owner (2026-11-13):
// - sail/feather table prices include the construction (mast + base) = 250 000; canvas = price - 250 000;
// - double-sided flag (two printed sides + middle layer) = canvas x 2, construction added once;
// - classic and stretch flags have no construction;
// - delivery is approximate: sail/feather with construction 25 000 Tashkent / 35 000 regions per item,
//   anything else 15 000 / 20 000 per order.
export const CONSTRUCTION = 250000;
export const DELIVERY = { kit: { tashkent: 25000, regions: 35000 }, flat: { tashkent: 15000, regions: 20000 } };
export function calcData() {
  const rows = (key) => PRICES.find((p) => p.key === key).rows.map(([size, price], i) => ({ code: SIZES[i], size, price }));
  return {
    discount: DISCOUNT,
    delivery: DELIVERY,
    types: {
      parus: { kit: CONSTRUCTION, sizes: rows('parus') },
      rastyajka: { kit: 0, sizes: rows('rastyajka') },
      klassika: { kit: 0, sizes: rows('flag') },
    },
  };
}

// Price table for articles (<div data-price-table></div> in Markdown is replaced with it).
export function priceTableHtml(lang) {
  const head = `<tr><th>${lang === 'ru' ? 'Флаг' : 'Bayroq'}</th>${SIZES.map((s) => `<th>${s}</th>`).join('')}</tr>`;
  const body = PRICES.map((p) => `<tr><td class="size-table__name">${p.label[lang]}</td>` +
    p.rows.map(([size, price]) => `<td><span class="sz">${size}</span><b class="price-now">${num(price)}</b></td>`).join('') + '</tr>').join('');
  return `<div class="size-table-wrap"><table class="size-table article-prices"><thead>${head}</thead><tbody>${body}</tbody></table></div>` +
    `<p class="price-any">${lang === 'ru' ? 'Цены в сумах, размеры в сантиметрах.' : "Narxlar so'mda, o'lchamlar santimetrda."}</p>`;
}

// Price cards for articles: <div data-price-table="parus,flag"></div> in Markdown.
// "parus" covers sail and feather (same prices). Size M is marked as the standard street flag.
const CARD_TEXT = {
  ru: { parus: ['Флаг-парус и перо', 'С мачтой и бочкой-основанием'], flag: ['Классический флаг', 'Любой размер, без конструкции'], rastyajka: ['Растяжка', 'Без конструкции'],
        standard: 'стандарт', unit: 'см', cur: 'сум', note: 'Двусторонний флаг — полотно ×2, конструкция один раз. Если мачта уже есть, полотно паруса на 250 000 сум дешевле.' },
  uz: { parus: ['Parus va pero bayroq', 'Ustun va bochka-asos bilan'], flag: ['Klassik bayroq', "Istalgan o'lcham, konstruksiyasiz"], rastyajka: ['Rastyajka', 'Konstruksiyasiz'],
        standard: 'standart', unit: 'sm', cur: "so'm", note: "Ikki tomonlama bayroq — mato ×2, konstruksiya bir marta. Ustuningiz bo'lsa, parus matosi 250 000 so'm arzon." },
};
export function priceCardsHtml(lang, keys = ['parus', 'flag']) {
  const T = CARD_TEXT[lang];
  const nb = (n) => num(n).replace(/ /g, ' ');
  const cards = keys.map((key) => {
    const p = PRICES.find((x) => x.key === key);
    if (!p) return '';
    const rows = p.rows.map(([size, price], i) => {
      const std = key === 'parus' && SIZES[i] === 'M';
      return `<li${std ? ' class="is-standard"' : ''}><span class="price-card__size"><b>${SIZES[i]}</b> ${size} ${T.unit}${std ? ` <em>${T.standard}</em>` : ''}</span><span class="price-card__price">${nb(price)} ${T.cur}</span></li>`;
    }).join('');
    return `<div class="price-card"><div class="price-card__head"><h3>${T[key][0]}</h3><p>${T[key][1]}</p></div><ul class="price-card__rows">${rows}</ul></div>`;
  }).join('');
  return `<div class="price-cards">${cards}</div><p class="price-cards__note">${T.note}</p>`;
}
