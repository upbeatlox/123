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

    // Фон внутри сцены — непрозрачный (иначе стекло его не преломляет), без линий:
    // тёмная база и несколько мягких световых пятен разной яркости. Сквозь стекло они
    // растягиваются в плавные переливы и радужные края — так преломление читается красиво.
    // Фон сцены (рисуется в canvas → текстура): фото справа, растворяющееся влево в темноту,
    // белый контровой свет справа сверху. Фон внутри 3D-сцены, поэтому стекло его преломляет.
    let W = 2048, H = 1152; const bgCanvas = document.createElement('canvas');
    bgCanvas.width = W; bgCanvas.height = H;
    let photoImg = null, bgAspect = 0;
    const bgTex = new THREE.CanvasTexture(bgCanvas);
    bgTex.colorSpace = THREE.SRGBColorSpace; bgTex.generateMipmaps = false; bgTex.minFilter = THREE.LinearFilter;
    // чёрно-белая копия фото (по пикселям — работает во всех браузерах, включая Safari);
    // салатовый контровой свет потом ложится поверх
    let bwCache = null;
    function bwPhoto(img) {
      if (bwCache) return bwCache;
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
      for (let i = 0; i < p.length; i += 4) { const l = p[i] * 0.2126 + p[i + 1] * 0.7152 + p[i + 2] * 0.0722; p[i] = p[i + 1] = p[i + 2] = l; }
      x.putImageData(d, 0, 0);
      return (bwCache = c);
    }
    function drawBg(photo) {
      const g = bgCanvas.getContext('2d');
      g.globalCompositeOperation = 'source-over'; g.filter = 'none';
      g.fillStyle = '#0a0b0e'; g.fillRect(0, 0, W, H);
      // мягкий свет: сверху — нейтральный «софтбокс» над логотипом, снизу — тонкое салатовое свечение «пола»,
      // по краям — затемнение (виньетка). Спокойно и симметрично, без диагональных лучей
      g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(60px)';
      g.translate(W / 2, -H * 0.05); g.scale(1.6, 1);
      const top = g.createRadialGradient(0, 0, 0, 0, 0, H * 0.75);
      top.addColorStop(0, 'rgba(230,236,245,0.16)'); top.addColorStop(0.5, 'rgba(200,210,225,0.05)'); top.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = top; g.fillRect(-W, -H, W * 2, H * 3); g.restore();
      // салатовое свечение прямо за логотипом: стекло преломляет его в яркие грани и переливы
      g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(50px)';
      g.translate(W * (W / H > 1.2 ? 0.6 : 0.5), H * 0.52); g.scale(0.8, 1);
      const aura = g.createRadialGradient(0, 0, 0, 0, 0, H * 0.5);
      aura.addColorStop(0, 'rgba(236,255,150,0.30)'); aura.addColorStop(0.45, 'rgba(210,255,0,0.08)'); aura.addColorStop(1, 'rgba(210,255,0,0)');
      g.fillStyle = aura; g.fillRect(-W, -H, W * 2, H * 2); g.restore();
      g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(40px)';
      g.translate(W / 2, H * 1.02); g.scale(3.2, 1);
      const floor = g.createRadialGradient(0, 0, 0, 0, 0, H * 0.28);
      floor.addColorStop(0, 'rgba(210,255,0,0.16)'); floor.addColorStop(0.6, 'rgba(210,255,0,0.04)'); floor.addColorStop(1, 'rgba(210,255,0,0)');
      g.fillStyle = floor; g.fillRect(-W, -H, W * 2, H * 2); g.restore();
      g.save(); g.filter = 'none';
      const vig = g.createRadialGradient(W / 2, H * 0.48, H * 0.35, W / 2, H * 0.48, Math.max(W, H) * 0.8);
      vig.addColorStop(0, 'rgba(10,11,14,0)'); vig.addColorStop(1, 'rgba(6,7,9,0.6)');
      g.fillStyle = vig; g.fillRect(0, 0, W, H); g.restore();
      g.filter = 'none';
      // огромный ник в фоне убран (по макету) — фон только тьма и луч света
      // дизеринг от «ступенек» в тёмных градиентах
      const img = g.getImageData(0, 0, W, H), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 4; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      g.putImageData(img, 0, 0);
      bgTex.needsUpdate = true;
    }
    drawBg(null);
    if (document.fonts && document.fonts.ready) document.fonts.load('600 100px Inter').then(() => drawBg(photoImg)).catch(() => {});
    const photo = new Image();
    photo.onload = () => { photoImg = photo; drawBg(photo); };
    // фон первого экрана — приглушённый коллаж работ
    // коллаж на фоне отключён — фон теперь типографика (ник). Вернуть: photo.src = '/assets/img/intro-works.jpg?v=1';
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: bgTex, toneMapped: false }));
    backdrop.position.z = -3; scene.add(backdrop);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    // мягкий салатовый контровой свет сзади-сверху и холодный заполняющий спереди
    const rim = new THREE.PointLight(0xffffff, 10, 20); rim.position.set(2.5, 2.5, -3); scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 1.2); fill.position.set(-3, 2, 5); scene.add(fill);

    const pivot = new THREE.Group(); scene.add(pivot);
    let modelSize = new THREE.Vector3(4.2, 4, 1); // уточняется после загрузки
    let offsetX = 0;
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
            m.transmission = 1; m.thickness = 0.9; m.ior = 1.5;
            m.roughness = 0.15; m.metalness = 0;                    // лёгкая матовость: стекло светлее и мягче, не «тяжёлое» (0 — полностью прозрачное)
            m.dispersion = 0;                                       // без дисперсии — она давала цветные «пиксельные» каймы                                      // радужное расслоение на гранях
            m.clearcoat = 1; m.clearcoatRoughness = 0.04;
            m.specularIntensity = 0.6;
            m.color = new THREE.Color(0xf6ffd0);                     // светлый салатовый: стекло пропускает фон, а не красит его в пластик                     // фирменный салатовый — окрашивает прозрачное стекло                     // почти белое стекло — цвет даёт толщина
            m.attenuationColor = new THREE.Color(0xd2ff00); m.attenuationDistance = 4;   // насыщенный #d2ff00 в толще и на торцах, как у цветного стекла
            m.emissive = new THREE.Color(0x000000); m.emissiveIntensity = 0;    // в толще цвет чуть гуще, как у цветного стекла
            m.iridescence = 0.15; m.iridescenceIOR = 1.3; m.iridescenceThicknessRange = [120, 420];
          }
          m.envMapIntensity = 2.2;
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

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // камера отъезжает так, чтобы логотип занимал ~70% высоты (заголовок первого экрана идёт поверх него)
      // и не больше 70% ширины экрана; на телефоне — почти во всю ширину
      const half = THREE.MathUtils.degToRad(camera.fov / 2);
      const byH = (modelSize.y / 2) / Math.tan(half) / (camera.aspect > 1.2 ? 0.7 : 0.5);
      const byW = (modelSize.x / 2) / (Math.tan(half) * camera.aspect) / (camera.aspect < 0.7 ? 0.88 : 0.70);
      camera.position.z = Math.max(byH, byW) + modelSize.z / 2;
      // на широком экране логотип смещён вправо от центра, освобождая место под заголовок
      offsetX = camera.aspect > 1.2 ? 2 * Math.tan(half) * camera.position.z * camera.aspect * 0.1 : 0;   // на широком экране — правее центра (как на витрине)
      // фон ровно на весь кадр (с запасом на покачивание)
      const d = camera.position.z - backdrop.position.z;
      const vh = 2 * Math.tan(half) * d * 1.02;
      backdrop.scale.set(vh * camera.aspect, vh, 1);
      // холст фона — в тех же пропорциях, что экран: фото сохраняет свои пропорции
      if (Math.abs(camera.aspect - bgAspect) > 0.01) {
        bgAspect = camera.aspect;
        H = 1152; W = Math.round(H * camera.aspect);
        bgCanvas.width = W; bgCanvas.height = H;
        bgTex.dispose();
        drawBg(photoImg);
      }
      camera.updateProjectionMatrix();
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
      pivot.position.y = modelSize.y * -0.03 + Math.sin(t * 1.1) * 0.08 * idle;   // чуть выше центра экрана
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
    }
    frame();
  }
}
