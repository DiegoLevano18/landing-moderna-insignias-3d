import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const acabados = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/acabados' }),
  schema: z.object({
    title: z.string(),
    resumen: z.string(),
    familia: z.enum(['TPU', 'Textil', 'Especial']),
    textura: z.enum(['tpu3d', 'tpu2d', 'flock', 'holo', 'tatami', 'bordado', 'cuero', 'chenille']),
    ideal: z.array(z.string()),
    orden: z.number(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(70),
    description: z.string().max(170),
    date: z.coerce.date(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { acabados, blog };
