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
