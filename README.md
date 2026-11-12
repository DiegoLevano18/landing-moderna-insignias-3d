# MARQA · Insignias 3D

Sitio de MARQA hecho con [Astro](https://astro.build): recorrido 3D con scroll (Three.js + GSAP), guía de acabados, y blog.

## Uso

```bash
npm install
npm run dev      # desarrollo en http://localhost:4321
npm run build    # revisa tipos y genera dist/
```

## Dónde cambiar cada cosa

| Qué | Dónde |
|---|---|
| WhatsApp, nombre, descripción, redes | `src/config.ts` |
| Colores (carbón, hueso, latón) y tipografía | `src/styles/global.css` |
| Escena 3D y pasos del scroll | `src/scripts/story.ts` |
| Acabados y blog | `src/content/` |

## Despliegue

`.github/workflows/deploy.yml` publica en GitHub Pages en cada push.

## Conexión futura con Supabase

Hoy el sitio es 100 % estático y no tiene backend. Está preparado para sumarlo sin rehacer páginas:

- Todo el contenido se pide desde `src/lib/content.ts`; ese es el único archivo que cambia al leer desde Supabase.
- Los esquemas de `src/content.config.ts` (acabados, blog) sirven de modelo para las tablas.
- `.env.example` reserva las variables `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`.
- Al conectar, hay que añadir el dominio del proyecto a `connect-src` en `astro.config.mjs` y activar permisos por fila (RLS) en cada tabla.

## Seguridad

- Política CSP generada por Astro con hashes: no se ejecutan scripts ni estilos externos.
- Sin claves en el repositorio. El formulario de cotización no envía datos a ningún servidor: abre WhatsApp.

## Pendiente

- Número real de WhatsApp en `src/config.ts`.
- Fotos reales de producto.
- Backend (Supabase), panel de administración, carrito y pasarela de pago.
