
const dprofileProjects=[{title:"SGAMING",tags:["Айдентика","Логотип","CS2","SMM-дизайн","Бренд-платформа","Мерч","Лексикон"],desc:"Мы выстроили айдентику на метафоре пиратского корабля: лев с боевым шрамом и мышью в зубах стал символом контроля, дерзости и опыта. Редизайн логотипа упростил геометрию и сделал знак выразительным и удобным для цифровой среды.",link:"https://dprofile.ru/case/147692/sgaming",cover:"https://cdn.dprofile.ru/files/10/9680/COVER/a6b55cc8-adfd-4c44-b2fc-5b18d277ee47_28002061.png",wide:true},{title:"THE GENTLEMEN ESPORTS",tags:["Бренд-платформа","Логотип","Айдентика","CS2","SMM-дизайн","Гайдбук"],desc:"Разработали логотип и визуальную айдентику бренда для киберспортивной организации TGM. Подобрали фирменные шрифты, цвета, сделали принципы и правила оформления рекламных коммуникаций и SMM.",link:"https://dprofile.ru/case/83891/the-gentlemen-esports",cover:"https://cdn.dprofile.ru/public/9680/83891/8f3973ac09e1fdd005069e972c83512801250cc6.png",wide:false},{title:"Resource Esports ",tags:["Бренд-платформа","Логотип","Айдентика","SMM-дизайн","Мерч"],desc:"Resource — киберспортивная организация, работающая в сфере профессионального компьютерного спорта с 2023 года. Составы выступают в трёх дисциплинах: Warface, Apex Legends и CS2.",link:"https://dprofile.ru/case/59822/resource-esports",cover:"https://cdn.dprofile.ru/public/9680/59822/68a619d8a7b6dc0f5cc572100ea701cc7743c684.png",wide:false},{title:"BLOODY CRYSTAL ESPORTS",tags:["Логотип","Сублого","SMM-дизайн","Мерч","Джерси"],desc:"Bloody Crystal — Российская киберспортивная организация. Они гордятся тем, что продвигают киберспорт как признанную профессиональную дисциплину, представляя Россию по всему миру.",link:"https://dprofile.ru/case/19889/bloody-crystal-esports-identity-2023",cover:"https://cdn.dprofile.ru/public/9680/19889/0d112d1bc6fa2898d07424b1d8f540e462e3f83f.png",wide:true}];

(function(){
 const c=document.getElementById('casesGridContainer');
 if(!c)return;
 c.innerHTML=dprofileProjects.map(p=>`
 <a href="${p.link}" target="_blank" rel="noopener noreferrer" class="case-card ${p.wide?'case-card--wide':''}">
 <div class="case-media">
 <img src="${p.cover}" alt="${p.title}" loading="lazy" class="case-cover-img">
 <div class="case-badge-platform">
 <span>Dprofile</span>
 <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
 </div>
 </div>
 <div class="case-meta">
 <div class="case-tags">${p.tags.map(t=>`<span class="case-tag">${t}</span>`).join('')}</div>
 <h3 class="case-name">${p.title}</h3>
 <p class="case-snippet">${p.desc}</p>
 <div class="case-action-hint"><span>Смотреть кейс</span> &rarr;</div>
 </div>
 </a>
 `).join('');
})();

(function(){
 const t=document.getElementById('typingText');
 if(!t)return;
 const w=["КИБЕРСПОРТА","МЕДИАСПОРТА","ПРО-КЛУБОВ","СПОРТИВНЫХ ЛИГ","ТУРНИРОВ","БЛОГЕРОВ","СТРИМЕРОВ"];
 let wi=0,ci=w[0].length,del=true;
 function loop(){
 const cw=w[wi];
 t.textContent=cw.substring(0,del?ci-1:ci+1);
 del?ci--:ci++;
 let d=del?50:90;
 if(!del&&ci===cw.length){d=2200;del=true}
 else if(del&&ci===0){del=false;wi=(wi+1)%w.length;d=400}
 setTimeout(loop,d);
 }
 setTimeout(loop,2200);
})();

;
/* Услуги: список-аккордеон — клик по строке раскрывает/сворачивает пункты */
(function () {
 var cards = document.querySelectorAll('.services-grid > .service-card:not(.is-wide-feature)');
 cards.forEach(function (card) {
  var a = document.createElement('span');
  a.className = 'service-arrow';
  a.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  card.appendChild(a);
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-expanded', 'false');
  function toggle() {
   var open = !card.classList.contains('is-open');
   card.classList.toggle('is-open', open);
   card.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
 });
})();
