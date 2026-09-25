const slides = [...document.querySelectorAll('.slide')];
const menu = document.querySelector('#menu');
const contents = document.querySelector('#contents');
let current = 0;
slides.forEach((slide, i) => {
  const link = document.createElement('a');
  link.href = `#${i + 1}`;
  const number = document.createElement('span');
  number.textContent = String(i + 1).padStart(2, '0');
  link.append(number, slide.dataset.title);
  link.addEventListener('click', () => toggleMenu(false));
  menu.append(link);
});
function toggleMenu(open) {
  menu.hidden = !open;
  contents.setAttribute('aria-expanded', String(open));
}
function show(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => { slide.hidden = i !== current; });
  document.body.classList.toggle('dark', slides[current].classList.contains('cover') || slides[current].classList.contains('closing'));
  document.querySelector('#counter').textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  document.querySelector('#progress').style.width = `${(current + 1) / slides.length * 100}%`;
  document.querySelector('#prev').disabled = current === 0;
  document.querySelector('#next').disabled = current === slides.length - 1;
  [...menu.children].forEach((link, i) => {
    if (i === current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = `${slides[current].dataset.title} — InsuranceCheck`;
  window.scrollTo(0, 0);
}
function go(index) { location.hash = String(Math.max(0, Math.min(slides.length - 1, index)) + 1); }
function fromHash() { const n = Number(location.hash.slice(1)); show(Number.isInteger(n) && n > 0 ? n - 1 : 0); }
document.querySelector('#prev').addEventListener('click', () => go(current - 1));
document.querySelector('#next').addEventListener('click', () => go(current + 1));
contents.addEventListener('click', () => toggleMenu(menu.hidden));
document.addEventListener('click', e => { if (!menu.contains(e.target) && !contents.contains(e.target)) toggleMenu(false); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { toggleMenu(false); contents.focus(); }
  if (e.target.closest('input,textarea,select,[contenteditable]')) return;
  if (['ArrowRight','PageDown','ArrowLeft','PageUp','Home','End'].includes(e.key)) {
    e.preventDefault(); toggleMenu(false);
    if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1);
    else go(current + (['ArrowRight','PageDown'].includes(e.key) ? 1 : -1));
  }
});
const fullscreen = document.querySelector('#fullscreen');
if (!document.fullscreenEnabled) fullscreen.hidden = true;
fullscreen.addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { fullscreen.textContent = 'Полный экран недоступен'; }
});
document.addEventListener('fullscreenchange', () => { fullscreen.textContent = document.fullscreenElement ? 'Выйти из полного экрана ↙' : 'На весь экран ↗'; });
let start;
document.querySelector('#deck').addEventListener('touchstart', e => { start = { x:e.changedTouches[0].clientX, y:e.changedTouches[0].clientY }; }, {passive:true});
document.querySelector('#deck').addEventListener('touchend', e => {
  if (!start || window.getSelection()?.toString()) return;
  const dx=e.changedTouches[0].clientX-start.x, dy=e.changedTouches[0].clientY-start.y;
  if (Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*2) go(current+(dx<0?1:-1));
  start=undefined;
}, {passive:true});
window.addEventListener('hashchange', fromHash);
fromHash();
