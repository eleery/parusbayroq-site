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
    draft: z.boolean().default(false),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});

export const collections = { blog };
