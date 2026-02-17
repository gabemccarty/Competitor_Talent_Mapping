/**
 * Returns full HTML string for the talent map globe + org chart panel.
 * Data is embedded; no external requests (except Three.js and texture CDN).
 */
export function getHtmlTemplate({ companyName, totalEmployees, locations, tierLevelNames, departmentColors }) {
  const locationsJson = JSON.stringify(locations);
  const tierNamesJson = JSON.stringify(tierLevelNames);
  const deptColorsJson = JSON.stringify(departmentColors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(companyName)} – Talent Map</title>
  <style>
    :root {
      --color-ai: #3498DB;
      --color-software: #27AE60;
      --color-systems: #E67E22;
      --color-hardware: #9B59B6;
      --color-product: #E91E63;
      --color-safety: #F39C12;
      --color-simulation: #16A085;
      --color-infrastructure: #7F8C8D;
      --bg-dark: #0d1117;
      --bg-medium: #161b22;
      --bg-light: #21262d;
      --bg-card: #1c2128;
      --text-primary: #f0f6fc;
      --text-secondary: #8b949e;
      --border-color: #30363d;
      --accent: #58a6ff;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; overflow: hidden; font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg-dark); color: var(--text-primary); }
    #globe-container { position: absolute; inset: 0; }
    #ui-overlay {
      position: absolute;
      top: 0; left: 0; right: 0;
      padding: 1rem 1.5rem;
      background: linear-gradient(to bottom, rgba(13,17,23,0.95) 0%, transparent 100%);
      pointer-events: none;
      z-index: 10;
    }
    #ui-overlay .inner { pointer-events: auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
    h1 { margin: 0; font-size: 1.35rem; font-weight: 600; }
    .subtitle { font-size: 0.85rem; color: var(--text-secondary); }
    .stats { display: flex; gap: 1.25rem; flex-wrap: wrap; }
    .stat { font-size: 0.8rem; color: var(--text-secondary); }
    .stat strong { color: var(--text-primary); }
    #panel {
      position: absolute;
      top: 0; right: 0;
      width: min(420px, 100vw);
      max-width: 100%;
      height: 100%;
      background: var(--bg-medium);
      border-left: 1px solid var(--border-color);
      box-shadow: -8px 0 24px rgba(0,0,0,0.4);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 20;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    #panel.open { transform: translateX(0); }
    #panel-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-card);
      flex-shrink: 0;
    }
    #panel-header h2 { margin: 0 0 0.25rem 0; font-size: 1.1rem; }
    #panel-header .meta { font-size: 0.8rem; color: var(--text-secondary); }
    #panel-close {
      position: absolute;
      top: 1rem; right: 1rem;
      width: 32px; height: 32px;
      border: none;
      background: var(--bg-light);
      color: var(--text-primary);
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.2rem;
      line-height: 1;
      padding: 0;
    }
    #panel-close:hover { background: var(--border-color); }
    #panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }
    .dept-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-bottom: 0.75rem;
      overflow: hidden;
    }
    .dept-card .dept-header {
      padding: 0.65rem 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-left: 4px solid var(--dept-color, var(--border-color));
      transition: background 0.2s;
    }
    .dept-card .dept-header:hover { background: var(--bg-light); }
    .dept-card .dept-name { font-weight: 600; font-size: 0.9rem; }
    .dept-card .dept-count { font-size: 0.8rem; color: var(--text-secondary); }
    .dept-card .dept-body { padding: 0 0.85rem 0.85rem; }
    .dept-card.collapsed .dept-body { display: none; }
    .tier-section { margin-top: 0.65rem; }
    .tier-section .tier-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-bottom: 0.35rem;
      padding-left: 0.25rem;
      border-left: 2px solid var(--dept-color, var(--border-color));
    }
    .employee-card {
      padding: 0.5rem 0.6rem;
      margin-bottom: 0.25rem;
      background: var(--bg-light);
      border-radius: 6px;
      border-left: 3px solid var(--dept-color, var(--border-color));
      transition: transform 0.2s;
    }
    .employee-card:hover { transform: translateX(4px); }
    .employee-card .emp-name {
      font-weight: 500;
      font-size: 0.9rem;
    }
    .employee-card .emp-name a { color: var(--accent); text-decoration: none; }
    .employee-card .emp-name a:hover { text-decoration: underline; }
    .employee-card .emp-title { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.15rem; }
    .employee-card .emp-location { font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.1rem; }
    .hint {
      position: absolute;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.8rem;
      color: var(--text-secondary);
      background: rgba(22,27,34,0.9);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      pointer-events: none;
      z-index: 10;
    }
  </style>
</head>
<body>
  <div id="globe-container"></div>
  <div id="ui-overlay">
    <div class="inner">
      <div>
        <h1>${escapeHtml(companyName)} – Talent Map</h1>
        <div class="subtitle">Click a location on the globe to view org structure</div>
      </div>
      <div class="stats">
        <span class="stat"><strong id="total-count">${totalEmployees}</strong> employees</span>
        <span class="stat"><strong id="location-count">${locations.length}</strong> locations</span>
      </div>
    </div>
  </div>
  <div id="panel">
    <div id="panel-header">
      <button id="panel-close" type="button" aria-label="Close">&times;</button>
      <h2 id="panel-title">Location</h2>
      <div class="meta" id="panel-meta"></div>
    </div>
    <div id="panel-content"></div>
  </div>
  <div class="hint">Drag to rotate · Scroll to zoom · Click pins to open org chart</div>

  <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
      }
    }
  </script>
  <script>
    window.__TALENT_MAP__ = {
      locations: ${locationsJson},
      tierLevelNames: ${tierNamesJson},
      departmentColors: ${deptColorsJson}
    };
  </script>
  <script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    const { locations, tierLevelNames, departmentColors } = window.__TALENT_MAP__;

    const container = document.getElementById('globe-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2.8;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0d1117, 1);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.2;
    controls.maxDistance = 5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d3d56';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#1a5f7a';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    if (texture.colorSpace !== undefined) texture.colorSpace = THREE.SRGBColorSpace;
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      bumpScale: 0.05,
      specular: new THREE.Color(0x333333),
      shininess: 8,
    });
    const globe = new THREE.Mesh(geometry, globeMaterial);
    globeGroup.add(globe);

    const ambient = new THREE.AmbientLight(0x404060, 0.9);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    function latLngToVector3(lat, lng, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const r = radius || 1.002;
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    const pinGeometry = new THREE.SphereGeometry(0.012, 16, 16);
    const pinMaterial = new THREE.MeshBasicMaterial({ color: 0x58a6ff });
    const pinMeshes = [];
    const pinLocations = [];

    locations.forEach((loc, i) => {
      if (loc.count === 0) return;
      const pos = latLngToVector3(loc.lat, loc.lng);
      const scale = Math.min(1.5, 0.6 + Math.log10(1 + loc.count) * 0.35);
      const pin = new THREE.Mesh(pinGeometry, pinMaterial.clone());
      pin.position.copy(pos);
      pin.scale.setScalar(scale);
      pin.userData = { location: loc, index: i };
      globeGroup.add(pin);
      pinMeshes.push(pin);
      pinLocations.push(loc);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function onPointerMove(e) {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    function onPointerClick() {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(pinMeshes);
      if (hits.length > 0) {
        const obj = hits[0].object;
        openPanel(obj.userData.location);
      }
    }
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('click', onPointerClick);

    function openPanel(loc) {
      const panel = document.getElementById('panel');
      const titleEl = document.getElementById('panel-title');
      const metaEl = document.getElementById('panel-meta');
      const contentEl = document.getElementById('panel-content');
      titleEl.textContent = loc.label || 'Unknown';
      metaEl.textContent = loc.count + ' employees at this location';
      contentEl.innerHTML = '';

      const depts = loc.departments || {};
      const deptNames = Object.keys(depts).sort((a, b) => (depts[b].total || 0) - (depts[a].total || 0));
      deptNames.forEach((deptName) => {
        const deptData = depts[deptName];
        const color = departmentColors[deptName] || '#8b949e';
        const card = document.createElement('div');
        card.className = 'dept-card collapsed';
        card.style.setProperty('--dept-color', color);
        const header = document.createElement('div');
        header.className = 'dept-header';
        header.innerHTML = '<span class="dept-name">' + escapeHtml(deptName) + '</span><span class="dept-count">' + (deptData.total || 0) + ' employees</span>';
        const body = document.createElement('div');
        body.className = 'dept-body';
        const hierarchy = deptData.hierarchy || {};
        const tierOrder = ['0','1','2','3','4','5','6','7','8','9'];
        tierOrder.forEach((tierKey) => {
          if (!hierarchy[tierKey]) return;
          const tier = hierarchy[tierKey];
          const section = document.createElement('div');
          section.className = 'tier-section';
          section.innerHTML = '<div class="tier-title">' + escapeHtml(tier.level || tierLevelNames[tierKey]) + ' (' + (tier.employees ? tier.employees.length : 0) + ')</div>';
          (tier.employees || []).forEach((emp) => {
            const empCard = document.createElement('div');
            empCard.className = 'employee-card';
            const namePart = emp.linkedin
              ? '<a href="' + escapeHtml(emp.linkedin) + '" target="_blank" rel="noopener">' + escapeHtml(emp.name) + '</a>'
              : escapeHtml(emp.name);
            empCard.innerHTML = '<div class="emp-name">' + namePart + '</div><div class="emp-title">' + escapeHtml(emp.title || '') + '</div><div class="emp-location">' + escapeHtml(emp.location || '') + '</div>';
            section.appendChild(empCard);
          });
          body.appendChild(section);
        });
        header.addEventListener('click', () => card.classList.toggle('collapsed'));
        card.appendChild(header);
        card.appendChild(body);
        contentEl.appendChild(card);
      });

      panel.classList.add('open');
    }

    function escapeHtml(s) {
      if (s == null) return '';
      const div = document.createElement('div');
      div.textContent = s;
      return div.innerHTML;
    }

    document.getElementById('panel-close').addEventListener('click', () => {
      document.getElementById('panel').classList.remove('open');
    });

    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>`;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
