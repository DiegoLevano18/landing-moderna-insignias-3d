// Única puerta de acceso al contenido. Hoy lee archivos Markdown de src/content.
// Para pasar a Supabase basta con cambiar estas funciones (o el loader en content.config.ts);
// las páginas no necesitan tocarse.
import { getCollection } from 'astro:content';

export const getAcabados = async () =>
  (await getCollection('acabados')).sort((a, b) => a.data.orden - b.data.orden);

export const getPosts = async () =>
  (await getCollection('blog', (p) => !p.data.draft)).sort((a, b) => +b.data.date - +a.data.date);
