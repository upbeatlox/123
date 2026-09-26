/* Шапка: приводим любую (в т.ч. старую) разметку к виду «логотип слева — разделы по центру —
   «Обсудить проект» справа». На планшете и телефоне разделы и кнопка скрыты, остаётся бургер (header.css).
   Нужно, потому что шаблон шапки на сайте может быть старее, чем стили */
(function () {
 var inner = document.querySelector('.header-nav .header-inner');
 if (!inner) return;
 var side = inner.querySelector('.hdr-side'), center = inner.querySelector('.hdr-center'), actions = inner.querySelector('.header-actions');
 if (!side) { side = document.createElement('div'); side.className = 'hdr-side'; inner.insertBefore(side, inner.firstChild); }
 if (!center) { center = document.createElement('div'); center.className = 'hdr-center'; side.insertAdjacentElement('afterend', center); }
 if (!actions) { actions = document.createElement('div'); actions.className = 'header-actions'; inner.appendChild(actions); }
 var logo = inner.querySelector('.brand-logo'), toggle = inner.querySelector('#menuToggle');
 if (logo && logo.parentNode !== side) side.appendChild(logo);
 if (logo && !logo.querySelector('.brand-word')) logo.insertAdjacentHTML('beforeend', '<span class="brand-word">quzzeN</span>');
 // разделы по центру — те же ссылки, что в выпадающем меню
 if (!center.querySelector('.hdr-nav')) {
  var nav = document.createElement('nav'); nav.className = 'hdr-nav'; nav.setAttribute('aria-label', 'Разделы');
  var items = [].map.call(document.querySelectorAll('#siteMenu .site-menu-link'), function (a) { return [a.getAttribute('href'), a.textContent]; });
  if (!items.length) items = [['/#cases', 'Кейсы'], ['/rating', 'Рейтинг'], ['/publ', 'Статьи'], ['/about_me', 'Обо мне'], ['/#contacts', 'Контакты']];
  items.forEach(function (x) { var a = document.createElement('a'); a.className = 'hdr-nav-link'; a.href = x[0]; a.textContent = x[1]; nav.appendChild(a); });
  center.appendChild(nav);
 }
 var cta = actions.querySelector('.btn-cta');
 if (!cta) {
  cta = document.createElement('a'); cta.className = 'btn-cta'; cta.href = 'https://t.me/quzzen'; cta.target = '_blank'; cta.rel = 'noopener noreferrer';
  cta.innerHTML = '<span>Обсудить проект</span><svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  actions.insertBefore(cta, actions.firstChild);
 }
 if (toggle) {
  if (toggle.parentNode !== actions) actions.appendChild(toggle);
  toggle.setAttribute('aria-label', 'Меню');
  if (!toggle.querySelector('.burger-icon')) toggle.insertAdjacentHTML('beforeend', '<span class="burger-icon" aria-hidden="true"><i></i><i></i><i></i></span>');
 }
})();

;
/* Прелоадер: светящийся логотип поверх страницы, пока всё не загрузится.
   Снимается после полной загрузки страницы (а на главной — ещё и 3D-сцены), максимум через 8 с */
(function () {
 var p = document.querySelector('.site-preloader');   // уже стоит первым в шапке
 if (!p) {
  p = document.createElement('div');
  p.className = 'site-preloader'; p.setAttribute('aria-hidden', 'true');
  p.innerHTML = '<img src="/Logo.svg" alt="">';
  (document.body || document.documentElement).appendChild(p);
 }
 var loaded = false, done = false;
 function hide() {
  if (done) return; done = true;
  p.classList.add('is-done');
  setTimeout(function () { p.style.display = 'none'; }, 700);
 }
 function check() {
  if (!loaded) return;
  var intro = document.getElementById('intro3d');
  if (!intro || intro.classList.contains('is-ready') || intro.classList.contains('is-fallback')) hide();
 }
 window.addEventListener('load', function () { loaded = true; check(); });
 new MutationObserver(check).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['class'] });
 setTimeout(hide, 8000);
})();

;
/* AHEADER */
 (function() {
 const burgerBtn = document.getElementById('burgerBtn');
 const drawer = document.getElementById('mobileDrawer');
 const closeBtn = document.getElementById('drawerCloseBtn');
 const links = drawer ? drawer.querySelectorAll('.drawer-link') : [];

 function toggleMenu() {
 if (!drawer) return;
 drawer.classList.toggle('is-open');
 document.body.style.overflow = drawer.classList.contains('is-open') ? 'hidden' : '';
 }

 if (burgerBtn) burgerBtn.addEventListener('click', toggleMenu);
 if (closeBtn) closeBtn.addEventListener('click', toggleMenu);

 links.forEach(function(link) {
 link.addEventListener('click', function() {
 drawer.classList.remove('is-open');
 document.body.style.overflow = '';
 });
 });
 })();

;
/* Плавная прокрутка колесом мыши (Lenis). На телефонах — родная прокрутка.
   Внутренние прокручиваемые блоки (меню, списки, модалки) крутятся как обычно. */
(function () {
 if (!window.Lenis) return;
 if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 function scrollableInside(node) {
  for (var el = node; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
   var cs = getComputedStyle(el);
   if (/(auto|scroll)/.test(cs.overflowY + cs.overflowX) && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)) return true;
  }
  return false;
 }
 var lenis = new Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true, anchors: true, prevent: scrollableInside });
 window.lenis = lenis;
 function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
 requestAnimationFrame(raf);
})();

;
/* Меню: кнопка «меню» открывает/закрывает панель; закрытие — по ссылке, клику по затемнению, Esc */
(function () {
 var btn = document.getElementById('menuToggle'), menu = document.getElementById('siteMenu'),
     back = document.getElementById('siteMenuBackdrop'), root = document.documentElement;
 if (!btn || !menu) return;
 var label = btn.querySelector('.menu-label');
 function set(open) {
  root.classList.toggle('menu-open', open);
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  if (label) label.textContent = open ? label.dataset.close : label.dataset.open;
  if (window.lenis) { open ? window.lenis.stop() : window.lenis.start(); }
 }
 btn.addEventListener('click', function () { set(!root.classList.contains('menu-open')); });
 if (back) back.addEventListener('click', function () { set(false); });
 menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
 document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
})();

;
/* Первый экран главной: салатовое «Дизайн»; «Смотреть кейсы» — посередине между заголовком и описанием;
   «Обсудить проект» — в правом нижнем углу экрана. Работает с любой версией кода главной */
(function () {
 var ARROW = '<svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 var DOWN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 function run() {
  var title = document.querySelector('.intro3d-title'), copy = document.querySelector('.intro3d-copy'),
      sticky = document.querySelector('.intro3d-sticky');
  if (!title || !copy || !sticky) return;
  if (!title.querySelector('.intro3d-accent')) title.innerHTML = '<span class="intro3d-accent">Дизайн</span><br>для спорта';
  // убираем кнопки, прилепленные к заголовку (старая раскладка)
  var top = title.closest('.intro3d-top');
  if (top) { top.parentNode.insertBefore(title, top); top.remove(); }
  copy.querySelectorAll('.intro3d-cta,.intro3d-cases').forEach(function (el) { el.remove(); });
  // «Смотреть кейсы» — отдельным элементом между заголовком и описанием (flex распределит посередине)
  var cases = document.createElement('a');
  cases.className = 'intro3d-cases'; cases.href = '#cases'; cases.innerHTML = '<span>Смотреть кейсы</span>' + DOWN;
  title.insertAdjacentElement('afterend', cases);
  // старую кнопку из первого экрана убираем — теперь она закреплена в углу окна (см. ниже)
  sticky.querySelectorAll('.intro3d-cta').forEach(function (el) { el.remove(); });
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

;
/* «Обсудить проект» — плавающая кнопка, закреплённая в правом нижнем углу окна на всех страницах */
(function () {
 function add() {
  if (document.querySelector('.float-cta')) return;
  var a = document.createElement('a');
  a.className = 'float-cta'; a.href = 'https://t.me/quzzen'; a.target = '_blank'; a.rel = 'noopener';
  a.innerHTML = '<span>Обсудить проект</span><svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(a);
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();

;
/* «Обо мне» теперь отдельная страница: старые ссылки на якорь #about ведём на /about_me */
(function () {
 function fix() {
  document.querySelectorAll('a[href$="#about"]').forEach(function (a) { a.setAttribute('href', '/about_me'); });
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix); else fix();
})();

;
/* Услуги: одновременно раскрыт только один пункт — при открытии другого прошлый закрывается */
(function () {
 document.addEventListener('click', function (e) {
  var card = e.target.closest && e.target.closest('.services-grid > .service-card:not(.is-wide-feature)');
  if (!card) return;
  setTimeout(function () {                       // после того как home.js переключил нажатый пункт
   if (!card.classList.contains('is-open')) return;
   document.querySelectorAll('.services-grid > .service-card.is-open').forEach(function (c) {
    if (c !== card) { c.classList.remove('is-open'); c.setAttribute('aria-expanded', 'false'); }
   });
  }, 0);
 });
})();

;
/* Главная: заранее начинаем качать 3D-движок, модель и фон — пока грузится остальная страница */
(function () {
 if (location.pathname !== '/' && location.pathname !== '/index' && location.pathname !== '') return;
 var h = document.head;
 // только обычная предзагрузка файлов (as=script), НЕ modulepreload: modulepreload запускает загрузку модулей
 // раньше карты импортов на странице — браузер тогда игнорирует её и 3D-сцена не стартует
 [['preload', '/assets/vendor/three/build/three.module.min.js', 'script'],
  ['preload', '/assets/vendor/three/examples/jsm/loaders/GLTFLoader.js', 'script'],
  ['preload', '/assets/3d/logo-glass.glb?v=1', 'fetch'],
  ['preload', '/assets/img/logo-glass-poster.webp', 'image']].forEach(function (x) {
  var l = document.createElement('link'); l.rel = x[0]; l.href = x[1];
  if (x[2]) { l.as = x[2]; if (x[2] !== 'image') l.crossOrigin = 'anonymous'; }
  h.appendChild(l);
 });
})();

;
/* Первый экран v8 (по референсу «техно-витрина»): тёмная сцена с тонкими линиями сетки и кругами,
   большой стеклянный 3D-логотип в центре под наклоном, пиксельный заголовок слева вверху (последнее слово печатается),
   HUD-кольцо с именем справа, карточка «кто я» слева, соцсети и подпись внизу. Стили — header.css, 3D — intro3d.js */
(function () {
 var DOWN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 var ARROW = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 // слова из прежнего первого экрана (бэкап от 24.09.2026)
 var WORDS = ['киберспорта', 'медиаспорта', 'про-клубов', 'спортивных лиг', 'турниров', 'блогеров', 'стримеров'];
 var LONGEST = WORDS.reduce(function (a, b) { return b.length > a.length ? b : a; });
 var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 // шрифты витрины: пиксельный для заголовка, моноширинный для «технических» подписей
 if (!document.querySelector('link[data-hero8-fonts]')) {
  var lf = document.createElement('link'); lf.rel = 'stylesheet'; lf.setAttribute('data-hero8-fonts', '');
  lf.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=JetBrains+Mono:wght@400;500;700;800&display=swap';
  document.head.appendChild(lf);
 }

 function build(sec, st) {
  sec.classList.remove('intro-v2', 'intro-v3', 'intro-v4', 'intro-v5', 'intro-v7'); sec.classList.add('intro-v8');
  st.querySelectorAll('.hero2,.hero3,.hero3-photo,.hero4,.hero5,.hero7,.hero8,.intro3d-poster').forEach(function (e) { e.remove(); });
  st.insertAdjacentHTML('beforeend',
   '<img class="intro3d-poster" src="/assets/img/logo-glass-poster.webp" alt="" aria-hidden="true">' +
   '<div class="hero8">' +
    '<div class="hero8-grid" aria-hidden="true"><i class="v1"></i><i class="v2"></i><i class="h1"></i><i class="c1"></i><i class="c2"></i></div>' +
    '<div class="hero8-head">' +
     '<p class="hero8-kicker hero8-anim">// quzzeN — бренд-дизайн</p>' +
     '<h1 class="hero8-title">' +
      '<span class="hero8-line">Дизайн для</span> ' +
      '<span class="hero8-line">спорта и</span> ' +
      '<span class="hero8-line"><span class="hero3-type">' + WORDS[0] + '</span><span class="hero3-caret" aria-hidden="true"></span></span>' +
     '</h1>' +
    '</div>' +
    '<a class="hero8-card hero8-anim" href="/about_me">' +
     '<span class="hero8-card-tag">Обо мне</span>' +
     '<img class="hero8-card-img" src="/assets/img/works/w1.jpg" alt="">' +
     '<span class="hero8-card-text"><b>Денис Савицкий</b> — независимый арт-директор и бренд-дизайнер. Айдентика, форма команд, мерч и SMM.</span>' +
    '</a>' +
    '<a class="hero8-hud hero8-anim" href="/rating" aria-label="CS2 Design Tier List">' +
     '<svg class="hero8-ring" viewBox="0 0 200 200" aria-hidden="true">' +
      '<circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/>' +
      '<circle cx="100" cy="100" r="92" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="70 508" transform="rotate(-150 100 100)"/>' +
      '<circle cx="100" cy="100" r="92" fill="none" stroke="#d2ff00" stroke-width="3" stroke-linecap="round" stroke-dasharray="22 556" transform="rotate(30 100 100)"/>' +
      '<circle cx="100" cy="100" r="74" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="1" stroke-dasharray="2 6"/>' +
     '</svg>' +
     '<span class="hero8-hud-pill">CS2 Tier List</span>' +
     '<span class="hero8-hud-arrow">' + ARROW + '</span>' +
    '</a>' +
    '<div class="hero8-bottom hero8-anim">' +
     '<div class="hero8-social">' +
      '<a href="https://t.me/quzzen" target="_blank" rel="noopener" aria-label="Telegram"><img src="/Icons/Telegram.svg" alt=""></a>' +
      '<a href="https://vk.com/quzzen" target="_blank" rel="noopener" aria-label="ВКонтакте"><img src="/Icons/VK.svg" alt=""></a>' +
      '<a href="https://behance.net/quzzen" target="_blank" rel="noopener" aria-label="Behance"><img src="/Icons/Behance.svg" alt=""></a>' +
     '</div>' +
     '<p class="hero8-foot">Чита · Worldwide Remote</p>' +
    '</div>' +
    '<a class="hero8-scroll hero8-anim" href="#cases"><span>Смотреть кейсы</span>' + DOWN + '</a>' +
   '</div>');
  // холст мог остаться в панели прошлой версии — возвращаем на весь экран
  var canvas = document.getElementById('intro3dCanvas');
  if (canvas && canvas.parentNode !== st) { st.insertBefore(canvas, st.firstChild); window.dispatchEvent(new Event('resize')); }
 }

 // кегль заголовка — по CSS, но уменьшаем, если строка с самым длинным словом не влезает в отведённую ширину
 function fitter(hero) {
  var head = hero.querySelector('.hero8-head'), title = hero.querySelector('.hero8-title'), type = hero.querySelector('.hero3-type');
  return function fit() {
   hero.style.removeProperty('--h8-fs');
   var keep = type.textContent; type.textContent = LONGEST;
   var fs = parseFloat(getComputedStyle(title).fontSize), box = head.getBoundingClientRect(), k = 1;
   title.querySelectorAll('.hero8-line').forEach(function (ln) {
    var r = document.createRange(); r.selectNodeContents(ln); var b = r.getBoundingClientRect();
    if (b.right > box.right) k = Math.min(k, (box.right - b.left) / b.width);
   });
   if (k < 1) hero.style.setProperty('--h8-fs', (fs * k * 0.97).toFixed(1) + 'px');
   type.textContent = keep;
  };
 }

 // «печатная машинка»: последнее слово стирается бэкспейсом и печатается новое
 function typer(el) {
  if (reduce || el.dataset.typing) return; el.dataset.typing = '1';
  var wi = 0, del = true, text = WORDS[0];
  function step() {
   var d;
   if (del) { text = text.slice(0, -1); d = 45; if (!text) { del = false; wi = (wi + 1) % WORDS.length; d = 350; } }
   else { text = WORDS[wi].slice(0, text.length + 1); d = 85; if (text === WORDS[wi]) { del = true; d = 2000; } }
   el.textContent = text;
   setTimeout(step, d);
  }
  setTimeout(step, 2600);
 }

 // появление — когда снят прелоадер (иначе анимация пройдёт под ним)
 function reveal(sec, then) {
  var fired = false;
  function go() {
   if (fired) return; fired = true;
   sec.classList.add('hero-go'); then();
   setTimeout(function () { sec.classList.add('hero-done'); }, reduce ? 0 : 2400);
  }
  var p = document.querySelector('.site-preloader');
  if (!p || p.classList.contains('is-done') || p.style.display === 'none') return go();
  new MutationObserver(function (m, o) { if (p.classList.contains('is-done')) { o.disconnect(); setTimeout(go, 250); } })
   .observe(p, { attributes: true, attributeFilter: ['class'] });
  setTimeout(go, 9000);
 }

 // шапка прозрачная, пока страница в самом верху; «Обсудить проект» в углу (телефон, планшет)
 // прячется, пока виден первый экран
 function watch(sec) {
  var root = document.documentElement, queued = false;
  function upd() {
   queued = false;
   var r = sec.getBoundingClientRect();
   root.classList.toggle('hdr-over-hero', window.scrollY < 24);
   root.classList.toggle('intro-on', r.bottom > window.innerHeight * 0.4);
  }
  function req() { if (!queued) { queued = true; requestAnimationFrame(upd); } }
  window.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', req);
  upd();
 }

 function start() {
  var sec = document.getElementById('intro3d'), st = sec && sec.querySelector('.intro3d-sticky');
  if (!st || sec.classList.contains('intro-v8')) return;
  build(sec, st);
  var hero = st.querySelector('.hero8'), fit = fitter(hero);
  fit(); window.addEventListener('resize', fit);
  if (document.fonts) { document.fonts.ready.then(fit); document.fonts.load('40px "Press Start 2P"').then(fit).catch(function () {}); }
  watch(sec);
  reveal(sec, function () { typer(hero.querySelector('.hero3-type')); });
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
