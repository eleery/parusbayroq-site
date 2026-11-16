import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog articles: src/content/blog/<lang>/<slug>.md. The same `pair` links the RU and UZ versions.
// draft: true — visible only in the preview build (npm run build:preview), not on the live site.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    lang: z.enum(['ru', 'uz']),
    pair: z.string(),
    cover: z.string().optional(),
    // SEO description of the cover image (alt text): what is in the photo + flag type + city.
    coverAlt: z.string().optional(),
    // Shown on the homepage block as «Популярное» (chosen by search demand / Webmaster data).
    popular: z.boolean().default(false),
    draft: z.boolean().default(false),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});

export const collections = { blog };
