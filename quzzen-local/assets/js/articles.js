
 document.addEventListener('DOMContentLoaded', function () {
  // активная вкладка рубрики
  var m = location.pathname.match(/^\/publ\/(?:[^\/]+\/)?(\d+)(?:$|[\/-])/);
  var id = m ? m[1] : (location.pathname.replace(/\/$/, '') === '/publ' ? '' : null);
  document.querySelectorAll('.publ-tab-btn').forEach(function (a) {
   var t = a.getAttribute('data-cat');
   a.classList.toggle('is-active', id !== null && t === id);
  });
  // буква-аватар автора
  document.querySelectorAll('.publ-author-avatar[data-name]').forEach(function (el) {
   var n = (el.getAttribute('data-name') || '').trim();
   el.querySelector('span').textContent = n ? n.charAt(0).toUpperCase() : 'Q';
  });
  // пустой список
  var all = document.getElementById('allEntries');
  var grid = document.getElementById('publGridContainer');
  if (grid && (!all || !all.querySelector('.publ-card'))) {
   grid.classList.add('is-grid');
   grid.innerHTML = '<div class="publ-empty">Здесь пока нет статей. Станьте первым автором!</div>';
  }
 });
