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
