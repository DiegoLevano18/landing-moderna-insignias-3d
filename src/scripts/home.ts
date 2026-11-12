// Interacciones de la portada. La escena 3D se carga aparte para no frenar la primera vista.
const story = document.querySelector<HTMLElement>('.story');
if (story) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl = (() => {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return false;
    }
  })();
  if (reduce || !gl) {
    story.classList.add('is-static');
  } else {
    const load = () => import('./story').then((m) => m.initStory(story)).catch(() => story.classList.add('is-static'));
    'requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 1200 }) : setTimeout(load, 200);
  }
}

// Antes / después sobre la prenda
document.querySelectorAll<HTMLElement>('.tee').forEach((tee) => {
  const input = tee.querySelector('input')!;
  const sync = () => tee.style.setProperty('--cut', `${100 - Number(input.value)}%`);
  input.addEventListener('input', sync);
  sync();
});

// Cotización: arma el mensaje y abre WhatsApp. No se envía ningún dato a un servidor nuestro.
const form = document.querySelector<HTMLFormElement>('#quote-form');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const get = (k: string) => String(d.get(k) ?? '').trim().slice(0, 600);
  const lines = [
    'Hola MARQA, quiero cotizar insignias.',
    `Nombre: ${get('nombre')}`,
    `Tipo de pieza: ${get('tipo')}`,
    `Acabado: ${get('acabado')}`,
    `Cantidad: ${get('cantidad')}`,
    get('detalle') && `Detalle: ${get('detalle')}`,
  ].filter(Boolean);
  const href = `https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(href, '_blank', 'noopener');
});
