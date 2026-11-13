# parusbayroq.uz

Сайт производителя рекламных флагов Parus Bayroq (Ташкент). Astro, статическая сборка, RU на `/`, UZ на `/uz/`.

- Владелец утверждает всё, что выходит на сайт. Узбекские тексты вычитывает он же.
- Факты о компании, цены и правила текстов — `content-plan/knowledge.md`. Ничего не придумывать сверх этого файла; если факта нет — спросить владельца.
- Цены — только в `src/lib/prices.mjs` (из него строятся таблицы, калькулятор и разметка).
- Блог: `src/content/blog/{ru,uz}/*.md`, общий `pair` связывает версии. Новая статья всегда `draft: true` до одобрения. Очередь тем — `content-plan/topics.md`.
- В каждой статье — открытая форма заказа в разделе «Как заказать»: метка `<div data-order-form></div>` в markdown (шаблон `src/components/BlogArticle.astro`; без метки форма встаёт после текста).
- Ежедневная статья — по `content-plan/agent.md` (картинки: `scripts/brand-image.mjs` наносит логотип, `npm run blog-images` готовит WebP).
- Проверка: `npm run build` (живой сайт) и `npm run build:local` (копия с черновиками, открывается с диска).
- Выкладка на Beget: push в ветку `deploy-update` (см. README). `api/`, `fold/`, `.htaccess` и `yandex_*.html` на хостинге не трогать.
