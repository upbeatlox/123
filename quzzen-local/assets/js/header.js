/* Прелоадер: светящийся логотип поверх страницы, пока всё не загрузится.
   Снимается после полной загрузки страницы (а на главной — ещё и 3D-сцены), максимум через 8 с */
(function () {
 var p = document.querySelector('.site-preloader');   // уже стоит первым в шапке
 if (!p) {
  p = document.createElement('div');
/* Шапка: приводим любую (в т.ч. старую) разметку к виду «логотип слева — меню с бургером справа».
   Нужно, потому что шаблон шапки на сайте может быть старее, чем стили */
(function () {
 var inner = document.querySelector('.header-nav .header-inner');
 if (!inner) return;
 var side = inner.querySelector('.hdr-side'), actions = inner.querySelector('.header-actions');
 if (!side) { side = document.createElement('div'); side.className = 'hdr-side'; inner.insertBefore(side, inner.firstChild); }
 if (!actions) { actions = document.createElement('div'); actions.className = 'header-actions'; inner.appendChild(actions); }
 var logo = inner.querySelector('.brand-logo'), toggle = inner.querySelector('#menuToggle');
 if (logo && logo.parentNode !== side) side.appendChild(logo);
 if (toggle) {
  if (toggle.parentNode !== actions) actions.appendChild(toggle);
  toggle.setAttribute('aria-label', 'Меню');
  if (!toggle.querySelector('.burger-icon')) toggle.insertAdjacentHTML('beforeend', '<span class="burger-icon" aria-hidden="true"><i></i><i></i><i></i></span>');
 }
 actions.querySelectorAll('.btn-cta').forEach(function (b) { b.remove(); });
 var center = inner.querySelector('.hdr-center'); if (center && !center.children.length) center.remove();
})();

;
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
  ['preload', '/assets/img/intro-works.jpg?v=1', 'image']].forEach(function (x) {
  var l = document.createElement('link'); l.rel = x[0]; l.href = x[1];
  if (x[2]) { l.as = x[2]; if (x[2] !== 'image') l.crossOrigin = 'anonymous'; }
  h.appendChild(l);
 });
})();

;
/* Первый экран v4 (фото-герой со смазанным движением, в цветах бренда): фото справа + салатовый шлейф
   + зерно; слева крупный лёгкий заголовок с печатающимся словом; справа вертикальное меню разделов.
   3D-логотип скрыт (не удалён) */
(function () {
 function build() {
  var sec = document.getElementById('intro3d'), st = sec && sec.querySelector('.intro3d-sticky');
  if (!st || sec.classList.contains('intro-v4')) return;
  sec.classList.remove('intro-v2', 'intro-v3'); sec.classList.add('intro-v4');
  st.querySelectorAll('.hero2,.hero3,.hero3-photo,.intro3d-poster').forEach(function (e) { e.remove(); });
  st.insertAdjacentHTML('beforeend',
   '<div class="hero4">' +
    '<div class="hero4-glow"></div>' +
    '<img class="hero4-photo" src="/assets/img/intro-photo-bw.jpg?v=1" alt="Денис Савицкий" fetchpriority="high">' +
    '<img class="hero4-smear" src="/assets/img/intro-smear.jpg?v=1" alt="" aria-hidden="true">' +
    '<div class="hero4-grain" aria-hidden="true"></div>' +
    '<div class="hero4-copy">' +
     '<p class="hero4-kicker">Денис Савицкий — арт-директор и бренд-дизайнер</p>' +
     '<h1 class="hero3-title hero4-title">Дизайн для спорта<br>и <span class="hero3-type">киберспорта</span><span class="hero3-caret"></span></h1>' +
     '<p class="hero4-lead">Айдентика, форма команд и визуальные экосистемы: от бренд-платформы до мерча и SMM.</p>' +
    '</div>' +
    '<nav class="hero4-nav" aria-label="Разделы">' +
     '<a href="#cases" class="is-active">Кейсы</a><a href="/rating">Рейтинг</a><a href="/publ">Статьи</a>' +
    '</nav>' +
   '</div>');
 }
 // «печатная машинка»: последнее слово стирается бэкспейсом и печатается новое
 function typer() {
  var el = document.querySelector('.hero3-type');
  if (!el || el.dataset.typing) return; el.dataset.typing = '1';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // слова из прежнего первого экрана (бэкап от 24.09.2026)
  var words = ['киберспорта', 'медиаспорта', 'про-клубов', 'спортивных лиг', 'турниров', 'блогеров', 'стримеров'];
  // фиксируем ширину заголовка по самому длинному слову — подпись справа не «ездит» при печати
  var title = el.closest('.hero3-title'), keep = el.textContent, longest = words.reduce(function (a, b) { return b.length > a.length ? b : a; });
  function lockWidth() { title.style.minWidth = ''; el.textContent = longest; title.style.minWidth = title.getBoundingClientRect().width + 'px'; el.textContent = text; }
  var text = keep;
  lockWidth(); window.addEventListener('resize', lockWidth);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockWidth);
  var wi = 0, del = true; text = words[0];
  function step() {
   var w = words[wi], d;
   if (del) { text = text.slice(0, -1); d = 45; if (!text) { del = false; wi = (wi + 1) % words.length; d = 350; } }
   else { text = words[wi].slice(0, text.length + 1); d = 85; if (text === words[wi]) { del = true; d = 2000; } }
   el.textContent = text;
   setTimeout(step, d);
  }
  setTimeout(step, 2200);
 }
 function start() { build(); typer(); }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
