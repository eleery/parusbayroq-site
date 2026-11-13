export const SITE = 'https://parusbayroq.uz';
export const LANGS = ['ru', 'uz'];
export const CONTACTS = {
  phone: '+998979000133', phoneText: '+998 97 900 01 33',
  manager: 'https://t.me/shox_11_01',
  channel: 'https://t.me/parusbayroq',
  instagram: 'https://www.instagram.com/parusbayroq/',
};
export const paths = (lang) => lang === 'ru'
  ? { home: '/', privacy: '/privacy/' }
  : { home: `/${lang}/`, privacy: `/${lang}/privacy/` };

export const META = {
  ru: {
    title: 'Флаг парус и рекламные флаги на заказ в Ташкенте | Parus Bayroq',
    description: 'Рекламные флаги на заказ: парус (виндер), перо, растяжка, флаги с логотипом — от 75 000 сум. Производитель в Ташкенте, бесплатный дизайн, срочно — от 2 часов.',
    keywords: 'флаг парус, рекламный флаг, флаг виндер, флаг перо, флаги на заказ, реклама флаг Ташкент, байроқ, parus bayroq, рекламные флаги Узбекистан, флаг растяжка, флажная сетка, yelkan bayroq, reklama bayroq, флаг классика, реклама флаг Узбекистан, уличная реклама флаги, изготовление флагов Ташкент, флаги для бизнеса, флаги для кафе, флаги для магазинов',
    locale: 'ru_RU', street: 'ул. Шота Руставели, 2/2', city: 'Ташкент',
  },
  uz: {
    title: 'Parus bayroq va reklama bayroqlari Toshkentda | Parus Bayroq',
    description: "Buyurtma asosida reklama bayroqlari: parus (vinder), pero, rastyajka, logotipli bayroqlar — 75 000 so'mdan. Toshkentda ishlab chiqaruvchi, bepul dizayn, shoshilinch — 2 soatdan.",
    keywords: "parus bayroq, yelkan bayroq, reklama bayroqlari, reklama bayroq, bayroq buyurtma, logotipli bayroq, bayroq narxi, bayroq tayyorlash, Toshkent",
    locale: 'uz_UZ', street: "Shota Rustaveli ko'chasi, 2/2", city: 'Toshkent',
  },
};

export function businessSchema(lang, description) {
  const m = META[lang];
  return {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': `${SITE}/#business`,
    name: 'Parus Bayroq', description, url: SITE + paths(lang).home,
    logo: `${SITE}/img/logo-512.png`, image: `${SITE}/images/og-image.jpg`,
    telephone: CONTACTS.phone, priceRange: '75 000–500 000 UZS', currenciesAccepted: 'UZS',
    address: { '@type': 'PostalAddress', streetAddress: m.street, addressLocality: m.city, addressCountry: 'UZ' },
    areaServed: { '@type': 'Country', name: 'Uzbekistan' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '09:00', closes: '18:30' }],
    paymentAccepted: 'Click, Payme, Cash, Bank transfer',
    sameAs: [CONTACTS.channel, CONTACTS.instagram],
  };
}
