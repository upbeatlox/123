/* si.t */
(function() {
 // Включаем только на десктопах с мышью
 if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

 const crosshair = document.getElementById('csCrosshair');
 if (!crosshair) return;

 let mouseX = -100;
 let mouseY = -100;

 // Мгновенное позиционирование без желеобразного лага
 window.addEventListener('mousemove', function(e) {
 mouseX = e.clientX;
 mouseY = e.clientY;
 crosshair.style.opacity = '1';
 crosshair.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
 }, { passive: true });

 document.addEventListener('mouseleave', function() {
 crosshair.style.opacity = '0';
 });

 // Отдача при клике
 window.addEventListener('mousedown', function() {
 crosshair.classList.add('is-active');
 });
 window.addEventListener('mouseup', function() {
 crosshair.classList.remove('is-active');
 });

 // Определение кликабельных элементов для анимации "захвата цели"
 const interactiveSelectors = 'a, button, input, textarea, .client-card, .case-card, .team-row-header, .filter-btn';

 document.addEventListener('mouseover', function(e) {
 if (e.target.closest(interactiveSelectors)) {
 crosshair.classList.add('is-hover');
 }
 });

 document.addEventListener('mouseout', function(e) {
 if (e.target.closest(interactiveSelectors)) {
 crosshair.classList.remove('is-hover');
 }
 });
})();
