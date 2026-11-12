// Copia el panel (Sveltia CMS) desde node_modules para servirlo desde nuestro propio dominio,
// con versión fijada en package-lock y sin depender de un CDN.
import { copyFileSync, mkdirSync } from 'node:fs';
mkdirSync('public/admin', { recursive: true });
copyFileSync('node_modules/@sveltia/cms/dist/sveltia-cms.js', 'public/admin/sveltia-cms.js');
