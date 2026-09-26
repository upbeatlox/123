/* Интро главной: стеклянный 3D-логотип.
   На входе логотип плавно покачивается, стрелка зовёт вниз.
   При прокрутке через секцию #intro3d логотип делает оборот, уменьшается и растворяется,
   дальше страница едет к блокам. Рендер идёт только пока секция видна. */
// three.js лежит на нашем хостинге (CDN jsdelivr у части провайдеров не открывается)
import * as THREE from '/assets/vendor/three/build/three.module.min.js';
import { GLTFLoader } from '/assets/vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from '/assets/vendor/three/examples/jsm/environments/RoomEnvironment.js';

const section = document.getElementById('intro3d');
const canvas = document.getElementById('intro3dCanvas');

// Кнопка «Обсудить проект» под заголовком и салатовое «Дизайн» — добавляем сами,
// если в коде страницы их ещё нет (чтобы работало даже со старой версией кода главной)
(function ensureIntroCopy() {
  const title = document.querySelector('.intro3d-title');
  if (!title) return;
  if (!title.querySelector('.intro3d-accent')) title.innerHTML = '<span class="intro3d-accent">Дизайн</span><br>для спорта';
  if (!document.querySelector('.intro3d-cta')) {
    const top = document.createElement('div'); top.className = 'intro3d-top';
    title.replaceWith(top); top.appendChild(title);
    top.insertAdjacentHTML('beforeend', '<a class="intro3d-cta" href="https://t.me/quzzen" target="_blank" rel="noopener"><span>Обсудить проект</span><svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>');
  }
})();

function fallback() { section && section.classList.add('is-fallback'); }

if (section && canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { fallback(); }

  if (renderer) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // рендер минимум в 1.5× (суперсэмплинг) — убирает «лесенку» и пиксели на гранях стекла на обычных мониторах
    // слабые устройства (мало ядер/памяти, телефоны) — рендер в 1×, остальные — 1.5–2× для гладких граней
    const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || /Mobi|Android/i.test(navigator.userAgent);
    renderer.setPixelRatio(weak ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(2, Math.max(1.5, window.devicePixelRatio || 1)));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    // «Студия»: мягкая комната + яркие световые панели — дают стеклу чёткие блики на гранях
    const studio = new RoomEnvironment(renderer);
    const panel = (w, h, x, y, z, ry, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); m.rotation.z += ry; studio.add(m);
    };
    panel(6, 1.2, 0, 6, 4, 0, 3);      // верхний софтбокс спереди
    panel(1.2, 8, -7, 1, 2, 0, 3);     // вертикальная полоса слева
    panel(1.2, 8, 7, 1, -2, 0, 2.5);      // вертикальная полоса справа-сзади
    panel(8, 0.6, 0, -5, -6, 0, 1.5);     // нижняя полоса сзади
    scene.environment = pmrem.fromScene(studio, 0.02).texture;

    // Отражения работ в гранях: картинки кейсов висят панелями вокруг логотипа внутри «студии»
    // (сами панели не видны — только их отражение в стекле, заметнее всего на торцах и гранях)
    const WORKS = ['/assets/img/works/w1.jpg', '/assets/img/works/w2.jpg', '/assets/img/works/w3.jpg', '/assets/img/works/w4.jpg']; // лёгкие копии (~190 КБ вместо 2,3 МБ)
    // положения панелей: слева, справа, сверху, спереди-снизу (за камерой) — под разные грани
    const SLOTS = [[-5.5, 0.5, 1.5], [5.5, -0.3, 1.2], [0.4, 5.2, 1.8], [-1.2, -4.8, 3.5]];
    const texLoader = new THREE.TextureLoader(); texLoader.setCrossOrigin('anonymous');
    let worksLeft = WORKS.length;
    WORKS.forEach((url, i) => texLoader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const a = tex.image.width / tex.image.height, h = 3.2;
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(h * a, h),
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, color: new THREE.Color(1.8, 1.8, 1.8) }));
      plane.position.set(...SLOTS[i]); plane.lookAt(0, 0, 0); studio.add(plane);
      if (--worksLeft === 0) {                          // все загрузились — пересобираем окружение
        const old = scene.environment;
        scene.environment = pmrem.fromScene(studio, 0.01).texture;
        old && old.dispose();
      }
    }, undefined, () => { worksLeft--; }));

    // Фон внутри сцены — непрозрачный (иначе стекло его не преломляет): чистая тьма, мягкое салатовое свечение
    // за логотипом и верхние строки заголовка первого экрана. Строки рисуются здесь ровно поверх их HTML-копии
    // (координаты присылает header.js событием 'intro3d:text'), поэтому стекло честно преломляет буквы.
    // Печатающееся слово остаётся обычным текстом страницы — его не нужно перерисовывать в 3D.
    let W = 2048, H = 1152, bgKey = '', bgTimer = 0;
    const bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
    const baseCanvas = document.createElement('canvas');            // фон без текста — пересобирается только при смене размера
    const bgTex = new THREE.CanvasTexture(bgCanvas);
    bgTex.colorSpace = THREE.SRGBColorSpace; bgTex.generateMipmaps = false; bgTex.minFilter = THREE.LinearFilter;
    let spot = { fx: 0.68, fy: 0.28 };                               // где стоит логотип (доли экрана) — туда же свечение
    let sceneText = null, textPending = false;

    function buildBase() {
      baseCanvas.width = W; baseCanvas.height = H;
      const g = baseCanvas.getContext('2d', { willReadFrequently: true });
      g.fillStyle = '#0a0b0e'; g.fillRect(0, 0, W, H);
      // салатовое свечение прямо за стеклом: оно преломляется в яркие грани, остальной фон — чистая тьма
      g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(50px)';
      g.translate(W * spot.fx, H * spot.fy); g.scale(0.9, 1);
      const aura = g.createRadialGradient(0, 0, 0, 0, 0, H * 0.42);
      aura.addColorStop(0, 'rgba(236,255,150,0.14)'); aura.addColorStop(0.45, 'rgba(210,255,0,0.045)'); aura.addColorStop(1, 'rgba(210,255,0,0)');
      g.fillStyle = aura; g.fillRect(-W, -H, W * 2, H * 2); g.restore();
      // дизеринг от «ступенек» в тёмных градиентах
      const img = g.getImageData(0, 0, W, H), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 4; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      g.putImageData(img, 0, 0);
    }
    function composeBg() {
      const g = bgCanvas.getContext('2d');
      g.drawImage(baseCanvas, 0, 0);
      if (sceneText && sceneText.length) {
        const k = W / Math.max(1, canvas.clientWidth);              // CSS-пиксели → пиксели текстуры
        g.save(); g.textBaseline = 'alphabetic'; g.fillStyle = '#ffffff';
        for (const ln of sceneText) {
          g.font = `${ln.weight} ${ln.size * k}px Inter, sans-serif`;
          if ('letterSpacing' in g) g.letterSpacing = `${ln.tracking * k}px`;
          g.fillText(ln.text, ln.x * k, ln.y * k);
        }
        g.restore();
      }
      bgTex.needsUpdate = true;
    }
    // размер текстуры фона — по реальным пикселям холста (чёткие буквы на ретине), с разумным потолком
    function refreshBg(now) {
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      if (!cw || !ch) return;
      let h = Math.min(Math.max(Math.round(ch * renderer.getPixelRatio()), 720), weak ? 1152 : 1600);
      let w = Math.round(h * cw / ch); if (w > 4096) { w = 4096; h = Math.round(w * ch / cw); }
      const key = `${w}x${h}@${spot.fx},${spot.fy}`;
      if (key === bgKey) return;
      const run = () => { bgKey = key; W = w; H = h; bgCanvas.width = W; bgCanvas.height = H; bgTex.dispose(); buildBase(); composeBg(); };
      clearTimeout(bgTimer);
      if (now) run(); else bgTimer = setTimeout(run, 180);          // при перетаскивании окна — один раз в конце
    }
    window.addEventListener('intro3d:text', (e) => {
      sceneText = e.detail && e.detail.lines ? e.detail.lines : null;
      composeBg(); textPending = !!sceneText;
    });
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: bgTex, toneMapped: false }));
    backdrop.position.z = -3; scene.add(backdrop);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    // мягкий салатовый контровой свет сзади-сверху и холодный заполняющий спереди
    const rim = new THREE.PointLight(0xffffff, 10, 20); rim.position.set(2.5, 2.5, -3); scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 1.2); fill.position.set(-3, 2, 5); scene.add(fill);

    const pivot = new THREE.Group(); scene.add(pivot);
    let modelSize = new THREE.Vector3(4.2, 4, 1); // уточняется после загрузки
    let offsetX = 0, offsetY = 0;
    const modelMats = [];

    new GLTFLoader().load('/assets/3d/logo-glass.glb?v=1', (gltf) => {
      const model = gltf.scene;
      // узел модели уже повёрнут экспортом из Blender лицом к камере — только центрируем по габаритам
      const holder = new THREE.Group();
      holder.add(model);
      holder.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(holder);
      const c = box.getCenter(new THREE.Vector3());
      holder.position.sub(c);
      box.getSize(modelSize);
      resize();
      model.traverse((o) => {
        if (o.isMesh && o.material) {
          const m = o.material;
          if (m.isMeshPhysicalMaterial) {
            m.transmission = 1; m.thickness = 1.1; m.ior = 1.5;
            m.roughness = 0.03; m.metalness = 0;                    // почти прозрачное: буквы заголовка за стеклом видны и преломляются
            m.dispersion = 0;                                       // без дисперсии — она давала цветные «пиксельные» каймы                                      // радужное расслоение на гранях
            m.clearcoat = 1; m.clearcoatRoughness = 0.04;
            m.specularIntensity = 0.6;
            m.color = new THREE.Color(0xf6ffd0);                     // светлый салатовый: стекло пропускает фон, а не красит его в пластик                     // фирменный салатовый — окрашивает прозрачное стекло                     // почти белое стекло — цвет даёт толщина
            m.attenuationColor = new THREE.Color(0xd2ff00); m.attenuationDistance = 3;   // насыщенный #d2ff00 в толще и на торцах, как у цветного стекла
            m.emissive = new THREE.Color(0x000000); m.emissiveIntensity = 0;    // в толще цвет чуть гуще, как у цветного стекла
            m.iridescence = 0.3; m.iridescenceIOR = 1.3; m.iridescenceThicknessRange = [120, 420];   // радужная плёнка на гранях
          }
          m.envMapIntensity = 1.9;
          m.transparent = true;
          modelMats.push(m);
          m.needsUpdate = true;
        }
      });
      pivot.add(holder);
      section.classList.add('is-ready');
    }, undefined, fallback);
    setTimeout(() => { if (!section.classList.contains('is-ready')) fallback(); }, 9000);

    // без переходов: при «уменьшить движение» глобальное правило сайта включает transition на всех свойствах,
    // и отступ замерялся посреди перехода — секция съезжала вправо и появлялась горизонтальная прокрутка
    section.style.transitionProperty = 'none';
    // Секция всегда ровно на всю ширину окна, от левого края — считаем по реальному положению
    // родителя, а не формулой calc(50% - 50vw): она ломается, если контейнер не по центру
    function fitSection() {
      section.style.marginLeft = '0px';
      const left = section.getBoundingClientRect().left;
      section.style.width = document.documentElement.clientWidth + 'px';
      section.style.marginLeft = (-left) + 'px';
    }
    fitSection();
    window.addEventListener('resize', fitSection);

    // где стоит логотип (доли экрана) и какую часть высоты/ширины занимает — под композицию первого экрана:
    // заголовок слева, стекло справа сверху и заходит на две верхние строки (печатающееся слово ниже — не задевает)
    function layoutFor(aspect) {
      if (aspect > 1.2) return { fx: 0.68, fy: 0.28, fillH: 0.4 };
      if (aspect > 0.9) return { fx: 0.66, fy: 0.3, fillH: 0.36 };
      return { fx: 0.6, fy: 0.34, fillW: 0.66 };                      // телефон и планшет вертикально — по ширине
    }
    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const L = layoutFor(camera.aspect), t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const dist = L.fillW ? (modelSize.x / 2) / (t * camera.aspect) / L.fillW : (modelSize.y / 2) / t / L.fillH;
      camera.position.z = dist + modelSize.z / 2;
      const visH = 2 * t * camera.position.z, visW = visH * camera.aspect;    // видимая область на глубине логотипа
      offsetX = (L.fx - 0.5) * visW; offsetY = (0.5 - L.fy) * visH;
      spot = { fx: L.fx, fy: L.fy };
      // фон ровно на весь кадр (без запаса) — буквы в нём совпадают с HTML-текстом до пикселя
      const vh = 2 * t * (camera.position.z - backdrop.position.z);
      backdrop.scale.set(vh * camera.aspect, vh, 1);
      camera.updateProjectionMatrix();
      refreshBg(!bgKey);
    }
    window.addEventListener('resize', resize);
    resize();

    const ease = (t) => t * t * (3 - 2 * t);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    let progress = 0, shown = 0, visible = true;

    function readScroll() {
      const r = section.getBoundingClientRect();
      // секция прилипает под шапкой (76px): прогресс 0..1 на всём пути прокрутки секции
      // интро — ровно один экран без «залипания»: анимация идёт, пока экран уезжает вверх,
      // а следующий блок сразу поднимается снизу — пустоты нет
      progress = clamp(-r.top / Math.max(1, r.height * 0.85), 0, 1);
      visible = r.bottom > 0 && r.top < window.innerHeight;
      section.style.setProperty('--intro-p', progress.toFixed(3));
    }
    window.addEventListener('scroll', readScroll, { passive: true });
    readScroll();

    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(section);

    // логотип чуть поворачивается вслед за курсором (только мышь, без «уменьшить движение»)
    const aim = { x: 0, y: 0 }, look = { x: 0, y: 0 };
    if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      window.addEventListener('pointermove', (e) => {
        aim.x = e.clientX / window.innerWidth * 2 - 1;
        aim.y = e.clientY / window.innerHeight * 2 - 1;
      }, { passive: true });
      document.documentElement.addEventListener('pointerleave', () => { aim.x = 0; aim.y = 0; });
    }

    const clock = new THREE.Clock();
    function frame() {
      requestAnimationFrame(frame);
      if (!visible || section.classList.contains('intro-v4')) return;   // 3D скрыт фото-героем — не рендерим
      const t = clock.getElapsedTime();
      shown += (progress - shown) * 0.12;            // плавно догоняем прокрутку
      const p = ease(shown);

      // покачивание на входе (затухает по мере прокрутки)
      const idle = reduce ? 0 : 1 - p;
      pivot.position.x = offsetX;
      pivot.position.y = offsetY + Math.sin(t * 1.1) * 0.08 * idle;
      look.x += (aim.x - look.x) * 0.05; look.y += (aim.y - look.y) * 0.05;
      const swayY = (Math.sin(t * 0.6) * 0.35 + look.x * 0.3) * idle;
      const swayX = (Math.sin(t * 0.8 + 1) * 0.12 + look.y * 0.18) * idle;

      // прокрутка: полный оборот + наклон, уменьшение и растворение
      pivot.rotation.y = swayY + p * Math.PI * 2;
      pivot.rotation.x = swayX + p * 0.35;
      pivot.rotation.z = -0.2 * (1 - p);                 // лёгкий наклон, как у товара на витрине
      const s = 1 - p * 0.45;
      pivot.scale.setScalar(s);
      // логотип исчезает в том же темпе, что и текст (в CSS: opacity = 1 - p * 1.15)
      const fadeModel = clamp(1 - progress, 0, 1);
      for (const m of modelMats) m.opacity = fadeModel;
      canvas.style.opacity = String(fadeModel);          // фото и свет гаснут в том же темпе
      pivot.visible = fadeModel > 0.001;

      renderer.render(scene, camera);
      // строки заголовка уже нарисованы в сцене и видны — HTML-копию можно прятать (header.js)
      if (textPending && section.classList.contains('is-ready')) { textPending = false; window.dispatchEvent(new Event('intro3d:text-shown')); }
    }
    frame();
  }
}
