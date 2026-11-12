// Datos del negocio en un solo lugar. Cambia aquí y se actualiza todo el sitio.
export const SITE = {
  name: 'MARQA',
  tagline: 'Pequeños detalles. Grandes marcas.',
  description:
    'Insignias, parches y escudos personalizados en TPU 3D, flock, bordado, cuero y más. Diseñamos, fabricamos y entregamos piezas listas para aplicar en tus prendas.',
  locale: 'es-PE',
  country: 'PE',
  // PENDIENTE: este es el número de relleno de la web anterior. Reemplázalo por el real (código de país + número, sin +).
  whatsapp: '51999999999',
  social: [] as string[],
};

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
/** Ruta interna respetando el subdirectorio de GitHub Pages. */
export const url = (path = '/') => `${base}${path.startsWith('/') ? path : `/${path}`}`;

export const waLink = (text: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
