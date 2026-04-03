import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const irregularidades = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/irregularidades" }),
  schema: z.object({
    id: z.number(),
    title: z.string(),
    afirmacion: z.string(),
    norma: z.string(),
    evidencia: z.string(),
    impacto: z.string(),
    replica: z.string().optional(),
    sources: z.array(z.string()).optional(),
  }),
});

export const collections = {
  irregularidades,
};
