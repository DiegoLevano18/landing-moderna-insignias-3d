# MARQA · Insignias 3D

Sitio de MARQA hecho con [Astro](https://astro.build): recorrido 3D con scroll (Three.js + GSAP), guía de acabados, blog y panel de administración.

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
| Acabados, blog y productos | `src/content/` o el panel `/admin/` |

## Panel de administración

`/admin/` abre Sveltia CMS. Se entra con una cuenta de GitHub que tenga permiso de escritura en este repositorio
(token personal con permiso *Contents: read and write* solo sobre este repo). Cada cambio se guarda como un commit y
vuelve a desplegar el sitio. La rama de trabajo se define en `public/admin/config.yml`.

## Despliegue

`.github/workflows/deploy.yml` publica en GitHub Pages en cada push. Requiere activar
*Settings → Pages → Source: GitHub Actions* una sola vez.

## Seguridad

- Política CSP generada por Astro con hashes: no se ejecutan scripts ni estilos externos.
- Sin claves en el repositorio. El formulario de cotización no envía datos a ningún servidor: abre WhatsApp.
- El panel se sirve desde el propio sitio con versión fijada en `package-lock.json`.

## Pendiente

- Número real de WhatsApp en `src/config.ts`.
- Fotos reales de producto.
- Carrito y pasarela de pago (el pago necesita un servicio de servidor; GitHub Pages solo sirve archivos estáticos).
