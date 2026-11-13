import { getCollection } from 'astro:content';

const showDrafts = process.env.PREVIEW === '1';
export const slugOf = (entry) => entry.id.split('/').pop();
export const blogIndex = (lang) => (lang === 'ru' ? '/blog/' : `/${lang}/blog/`);
export const postPath = (lang, slug) => `${blogIndex(lang)}${slug}/`;

export async function getPosts(lang) {
  const all = await getCollection('blog', (e) => e.data.lang === lang && (showDrafts || !e.data.draft));
  return all.sort((a, b) => b.data.date - a.data.date);
}

// Path of the same article in every language that has it.
export async function alternatesOf(entry) {
  const all = await getCollection('blog', (e) => e.data.pair === entry.data.pair && (showDrafts || !e.data.draft));
  return Object.fromEntries(all.map((e) => [e.data.lang, postPath(e.data.lang, slugOf(e))]));
}

export const BLOG_TEXT = {
  ru: {
    title: 'Блог Parus Bayroq — всё о рекламных флагах',
    description: 'Статьи о рекламных флагах: цены, размеры, выбор формы, печать, установка и уход.',
    h1: 'Блог о рекламных флагах', lead: 'Цены, размеры, печать, установка — простыми словами и с цифрами.',
    home: 'Главная', blog: 'Блог', read: 'Читать →', published: 'Опубликовано', updated: 'обновлено',
    ctaTitle: 'Рассчитать флаг для вашего бизнеса', ctaText: 'Калькулятор сразу покажет цену, а менеджер ответит в течение 10 минут.',
    ctaCalc: 'Открыть калькулятор', ctaTg: 'Написать в Telegram', related: 'Ещё статьи', faq: 'Вопросы и ответы', draft: 'Черновик — на сайте не опубликовано',
    months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  },
  uz: {
    title: 'Parus Bayroq blogi — reklama bayroqlari haqida',
    description: "Reklama bayroqlari haqida maqolalar: narxlar, o'lchamlar, shakl tanlash, bosma, o'rnatish va parvarish.",
    h1: 'Reklama bayroqlari haqida blog', lead: "Narxlar, o'lchamlar, bosma, o'rnatish — oddiy so'zlar va raqamlar bilan.",
    home: 'Bosh sahifa', blog: 'Blog', read: "O'qish →", published: 'Chop etilgan', updated: 'yangilangan',
    ctaTitle: 'Biznesingiz uchun bayroqni hisoblang', ctaText: "Kalkulyator narxni darhol ko'rsatadi, menejer esa 10 daqiqa ichida javob beradi.",
    ctaCalc: 'Kalkulyatorni ochish', ctaTg: 'Telegramda yozish', related: 'Boshqa maqolalar', faq: 'Savol va javoblar', draft: "Qoralama — saytda chop etilmagan",
    months: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  },
};
export const fmtDate = (d, lang) => {
  const m = BLOG_TEXT[lang].months[d.getUTCMonth()];
  return lang === 'ru' ? `${d.getUTCDate()} ${m} ${d.getUTCFullYear()}` : `${d.getUTCFullYear()}-yil ${d.getUTCDate()}-${m}`;
};
