import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const CONFIG = {
  desktopImageWidth: 400,
  tabletImageWidth: 330,
  mobileImageWidth: 260,
  desktopMaxParticles: 72000,
  tabletMaxParticles: 50000,
  mobileMaxParticles: 32000,
  bouquetWidth: 6.9,
  bouquetHeight: 7.2,
  particleSize: 0.059,
  highlightParticleSize: 0.086,
  backgroundParticleSize: 0.012,
  backgroundParticleCount: 180,
  frameOpacity: 0.0035,
  introDuration: 3.2,
  spring: 0.055,
  damping: 0.78,
  pointerRadius: 0.5,
  pointerForce: 0.014,
};

const LOVE_MESSAGES = [
  "你靠近一点，世界就柔软一点。",
  "有些心动很安静，却一直都在。",
  "愿今天的花，也替我拥抱你一下。",
  "你让平常的一天，也有了被记住的理由。",
  "喜欢你，是一件自然又认真的事。",
  "想把温柔留给你，也留给有你的日常。",
  "愿所有匆忙，都有人陪你慢下来。",
  "你不用一直发光，在我这里可以安心休息。",
  "和你分享的琐碎，是我最喜欢的日常。",
  "世界很大，遇见你是一件安静的幸运。",
  "希望以后说起我们，会有很多温柔的小事。",
  "比起短暂热烈，我更想陪你走很久。",
  "你在的时候，连沉默都变得温柔。",
  "愿你被爱，也永远有爱人的勇气。",
  "每一次想起你，心里都会亮一点。",
  "我想把慢慢变好的日子，都与你分享。",
  "遇见你以后，寻常风景也有了名字。",
  "愿你的每个清晨，都有值得期待的光。",
  "你不必成为谁的答案，做自己就很好。",
  "我喜欢的未来里，刚好一直有你。",
  "想陪你看很多花开，也看很多日落。",
  "你是我认真生活时，遇见的温柔回音。",
  "愿你走过的路，都有柔软的风相伴。",
  "和你并肩的时候，时间总显得刚刚好。",
  "你让我的世界，多了一种安静的欢喜。",
  "愿所有迟来的美好，都在向你靠近。",
  "心动不是喧哗，是每次见你都想微笑。",
  "我想记住的，不只是花，还有此刻的你。",
  "愿你累的时候，也有人轻轻接住你。",
  "你的存在，本身就是一件温柔的事。",
  "喜欢是想靠近，珍惜是想陪你很久。",
  "愿我们在平凡里，也能拥有细小的浪漫。",
  "你值得鲜花，也值得每一次真诚的偏爱。",
  "想把今天的好天气，连同想念一起给你。",
  "有你参与的日子，总比想象中更明亮。",
  "愿这束不会凋谢的花，替我说声想你。",
];

function createSeededRandom(seed) {
  return function random() {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

const FLOWER_HOTSPOT_POSITIONS = [
  [0.42, 0.16], [0.5, 0.16], [0.58, 0.17], [0.66, 0.19],
  [0.29, 0.24], [0.38, 0.23], [0.47, 0.25], [0.56, 0.24], [0.65, 0.25], [0.74, 0.27],
  [0.19, 0.34], [0.28, 0.33], [0.37, 0.35], [0.46, 0.33], [0.55, 0.36], [0.64, 0.34], [0.73, 0.36], [0.82, 0.35],
  [0.13, 0.45], [0.23, 0.43], [0.33, 0.46], [0.43, 0.44], [0.53, 0.47], [0.63, 0.44], [0.73, 0.47], [0.83, 0.44], [0.91, 0.46],
  [0.17, 0.55], [0.28, 0.56], [0.39, 0.54], [0.5, 0.57], [0.61, 0.55], [0.72, 0.57], [0.83, 0.55],
  [0.36, 0.66], [0.62, 0.65],
];
const FLOWER_HOTSPOTS = FLOWER_HOTSPOT_POSITIONS.map(([x, y], index) => ({
  x,
  y,
  radius: 0.046,
  message: LOVE_MESSAGES[index],
}));

console.log("three revision:", THREE.REVISION);

// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05050a, 0.025);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 60);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setClearColor(0x05050a, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.querySelector("#experience").prepend(renderer.domElement);

const bouquetGroup = new THREE.Group();
scene.add(bouquetGroup);

const loadingElement = document.querySelector("#loading");
const hintElement = document.querySelector("#hint");
const messageElement = document.querySelector("#message");
const messageText = document.querySelector("#message-text");
const progressElement = document.querySelector("#flower-progress");
const resetCollectionButton = document.querySelector("#reset-collection");
const titleMain = document.querySelector("#title span");
const titleMeta = document.querySelector("#title small");
const shareButton = document.querySelector("#share-button");
const customShareButton = document.querySelector("#custom-share-button");
const shareDialog = document.querySelector("#share-dialog");
const shareForm = document.querySelector("#share-form");
const shareCancelButton = document.querySelector("#share-cancel");
const shareToInput = document.querySelector("#share-to");
const shareFromInput = document.querySelector("#share-from");
const shareMessageInput = document.querySelector("#share-message");
const toastElement = document.querySelector("#toast");
const musicToggleButton = document.querySelector("#musicToggle");
const bgMusic = new Audio("./assets/music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.22;
let messageTimer = 0;
let toastTimer = 0;
let dedicationShown = false;
const DISCOVERY_STORAGE_KEY = "rose-universe:discovered-flowers:v1";
const COMPLETION_STORAGE_KEY = "rose-universe:collection-complete:v1";

function loadDiscoveredFlowers() {
  try {
    const stored = JSON.parse(localStorage.getItem(DISCOVERY_STORAGE_KEY) || "[]");
    return new Set(stored.filter((index) => Number.isInteger(index) && index >= 0 && index < FLOWER_HOTSPOTS.length));
  } catch {
    return new Set();
  }
}

const discoveredFlowers = loadDiscoveredFlowers();
let completionCelebrated = discoveredFlowers.size === FLOWER_HOTSPOTS.length;
try {
  completionCelebrated = completionCelebrated || localStorage.getItem(COMPLETION_STORAGE_KEY) === "1";
} catch {
  // In-memory completion state is enough when storage is unavailable.
}

function updateFlowerProgress() {
  progressElement.textContent = `♡ ${discoveredFlowers.size} / ${FLOWER_HOTSPOTS.length}`;
}

function discoverFlower(index) {
  if (discoveredFlowers.has(index)) return false;
  discoveredFlowers.add(index);
  updateFlowerProgress();
  try {
    localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify([...discoveredFlowers].sort((a, b) => a - b)));
  } catch {
    // The interaction remains usable when storage is blocked or unavailable.
  }
  if (discoveredFlowers.size === FLOWER_HOTSPOTS.length && !completionCelebrated) {
    completionCelebrated = true;
    try {
      localStorage.setItem(COMPLETION_STORAGE_KEY, "1");
    } catch {
      // Completion still appears once in the current visit.
    }
    return true;
  }
  return false;
}

updateFlowerProgress();

function readShareParameters() {
  const parameters = new URLSearchParams(window.location.search);
  return {
    to: (parameters.get("to") || "").trim().slice(0, 24),
    from: (parameters.get("from") || "").trim().slice(0, 24),
    message: (parameters.get("message") || "").trim().slice(0, 80),
  };
}

function applySharedTitle({ to, from }) {
  titleMain.textContent = to ? `送给 ${to} 的一束花` : "ROSE UNIVERSE";
  titleMeta.textContent = from ? `PARTICLE BOUQUET / FROM ${from}` : "PARTICLE BOUQUET / 01";
}

const initialShareParameters = readShareParameters();
applySharedTitle(initialShareParameters);

function showToast(text, duration = 2000) {
  window.clearTimeout(toastTimer);
  toastElement.textContent = text;
  toastElement.classList.add("visible");
  toastTimer = window.setTimeout(() => toastElement.classList.remove("visible"), duration);
}

function updateMusicButton() {
  const isPlaying = !bgMusic.paused;
  musicToggleButton.classList.toggle("is-playing", isPlaying);
  musicToggleButton.setAttribute("aria-pressed", String(isPlaying));
  musicToggleButton.setAttribute("aria-label", isPlaying ? "暂停背景音乐" : "播放背景音乐");
}

musicToggleButton.addEventListener("click", async () => {
  if (!bgMusic.paused) {
    bgMusic.pause();
    return;
  }

  try {
    await bgMusic.play();
  } catch (error) {
    console.warn("Background music playback failed:", error);
    showToast("音乐暂时无法播放");
  }
});

bgMusic.addEventListener("play", updateMusicButton);
bgMusic.addEventListener("pause", updateMusicButton);
bgMusic.addEventListener("error", () => {
  console.error("music.mp3 failed to load");
  updateMusicButton();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && !bgMusic.paused) bgMusic.pause();
});

updateMusicButton();

function isLocalAddress() {
  const hostname = window.location.hostname;
  const privateNetwork = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
  return window.location.protocol === "file:"
    || hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "0.0.0.0"
    || hostname === "[::1]"
    || hostname.endsWith(".local")
    || privateNetwork;
}

function buildShareUrl(values = readShareParameters()) {
  const url = new URL(window.location.href);
  const parts = [];
  const to = values.to.trim().slice(0, 24);
  const from = values.from.trim().slice(0, 24);
  const message = values.message.trim().slice(0, 80);
  if (to) parts.push(`to=${encodeURIComponent(to)}`);
  if (from) parts.push(`from=${encodeURIComponent(from)}`);
  if (message) parts.push(`message=${encodeURIComponent(message)}`);
  url.search = parts.length ? `?${parts.join("&")}` : "";
  url.hash = "";
  return url.href;
}

async function copyShareLink(url) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(url);
  } else {
    const field = document.createElement("textarea");
    field.value = url;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    if (!copied) throw new Error("Clipboard is unavailable");
  }
  showToast("链接已复制 ♡");
}

async function shareRoseUniverse(url = buildShareUrl()) {
  if (isLocalAddress()) {
    showToast("请先部署到公网 HTTPS 地址再分享", 3200);
    return;
  }

  const parameters = readShareParameters();
  const shareData = {
    title: parameters.to ? `送给 ${parameters.to} 的 Rose Universe` : "Rose Universe",
    text: "送你一束用代码生成的花 🌹",
    url,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Share cancelled:", error);
        return;
      }
      console.warn("Web Share failed, using clipboard fallback:", error);
    }
  }

  try {
    await copyShareLink(url);
  } catch (error) {
    console.error("Link copy failed:", error);
    showToast("复制失败，请手动复制浏览器地址", 3200);
  }
}

function openShareDialog() {
  const parameters = readShareParameters();
  shareToInput.value = parameters.to;
  shareFromInput.value = parameters.from;
  shareMessageInput.value = parameters.message;
  if (typeof shareDialog.showModal === "function") shareDialog.showModal();
  else shareDialog.setAttribute("open", "");
  window.setTimeout(() => shareToInput.focus(), 0);
}

function closeShareDialog() {
  if (typeof shareDialog.close === "function") shareDialog.close();
  else shareDialog.removeAttribute("open");
}

shareButton.addEventListener("click", () => shareRoseUniverse());
customShareButton.addEventListener("click", openShareDialog);
shareCancelButton.addEventListener("click", closeShareDialog);
shareDialog.addEventListener("click", (event) => {
  if (event.target === shareDialog) closeShareDialog();
});
shareForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = {
    to: shareToInput.value,
    from: shareFromInput.value,
    message: shareMessageInput.value,
  };
  const url = buildShareUrl(values);
  window.history.replaceState(null, "", url);
  applySharedTitle(readShareParameters());
  closeShareDialog();
  await shareRoseUniverse(url);
});

function createPointMaterial({
  pointSize,
  opacity,
  vertexColors = true,
  color = null,
  pulse = false,
  highlightOnly = false,
}) {
  const uniforms = {
    uPointSize: { value: pointSize },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uOpacity: { value: opacity },
  };

  if (color) uniforms.uColor = { value: new THREE.Color(color) };
  if (pulse) {
    uniforms.uPulseHotspot = { value: -2 };
    uniforms.uPulseStrength = { value: 0 };
  }

  return new THREE.ShaderMaterial({
    uniforms,
    vertexColors,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: `
      attribute float aSize;
      attribute float aOpacity;
      ${highlightOnly ? "attribute float aHighlight;" : ""}
      ${vertexColors ? "varying vec3 vColor;" : ""}
      ${pulse ? "attribute float aHotspot; varying float vPulse; uniform float uPulseHotspot; uniform float uPulseStrength;" : ""}
      varying float vOpacity;
      uniform float uPointSize;
      uniform float uPixelRatio;

      void main() {
        ${vertexColors ? "vColor = color;" : ""}
        ${pulse ? "vPulse = (1.0 - step(0.5, abs(aHotspot - uPulseHotspot))) * uPulseStrength;" : ""}
        vOpacity = aOpacity ${highlightOnly ? "* aHighlight" : ""};
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = clamp(
          uPointSize * aSize * ${highlightOnly ? "(1.0 + aHighlight * 0.16) *" : ""} ${pulse ? "(1.0 + vPulse * 0.12) *" : ""} uPixelRatio * (300.0 / -viewPosition.z),
          1.0,
          7.0
        );
      }
    `,
    fragmentShader: `
      ${vertexColors ? "varying vec3 vColor;" : "uniform vec3 uColor;"}
      ${pulse ? "varying float vPulse;" : ""}
      varying float vOpacity;
      uniform float uOpacity;

      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        float alpha = (1.0 - smoothstep(0.28, 0.50, d)) * uOpacity * vOpacity;
        if (alpha < 0.01) discard;
        vec3 pointColor = ${vertexColors ? "vColor" : "uColor"};
        ${highlightOnly ? "pointColor = min(pointColor * 1.12, vec3(1.0));" : ""}
        ${pulse ? "pointColor = min(pointColor * (1.0 + vPulse * 0.14), vec3(1.0));" : ""}
        gl_FragColor = vec4(pointColor, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
}

function createBackgroundParticles() {
  const count = CONFIG.backgroundParticleCount;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const opacities = new Float32Array(count);
  const palette = [new THREE.Color(0x9d567c), new THREE.Color(0x745278), new THREE.Color(0xd6c4c8)];

  for (let i = 0; i < count; i += 1) {
    const index = i * 3;
    const color = palette[Math.floor(Math.random() * palette.length)];
    positions[index] = (Math.random() - 0.5) * 22;
    positions[index + 1] = (Math.random() - 0.5) * 15;
    positions[index + 2] = -2 - Math.random() * 12;
    colors[index] = color.r;
    colors[index + 1] = color.g;
    colors[index + 2] = color.b;
    sizes[i] = 0.45 + Math.random() * 0.75;
    opacities[i] = 0.5 + Math.random() * 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));

  const points = new THREE.Points(
    geometry,
    createPointMaterial({
      pointSize: CONFIG.backgroundParticleSize,
      opacity: 0.18,
      vertexColors: true,
    }),
  );
  scene.add(points);
  return points;
}

function createSpatialFrame() {
  const box = new THREE.BoxGeometry(8.8, 8.0, 4.0);
  const edges = new THREE.EdgesGeometry(box);
  box.dispose();
  const frame = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: 0xe9e5ee,
      transparent: true,
      opacity: CONFIG.frameOpacity,
      depthWrite: false,
    }),
  );
  frame.position.z = -1.35;
  scene.add(frame);
  return frame;
}

const backgroundParticles = createBackgroundParticles();
const spatialFrame = createSpatialFrame();

// Continuous bouquet sampling — bouquet.png defines every target position
function srgbToLinear(value) {
  const channel = Math.max(0, Math.min(255, value)) / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function samplingProfile() {
  if (window.innerWidth < 768) {
    return { imageWidth: CONFIG.mobileImageWidth, maxParticles: CONFIG.mobileMaxParticles };
  }
  if (window.innerWidth < 1024) {
    return { imageWidth: CONFIG.tabletImageWidth, maxParticles: CONFIG.tabletMaxParticles };
  }
  return { imageWidth: CONFIG.desktopImageWidth, maxParticles: CONFIG.desktopMaxParticles };
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

const REFERENCE_FRAME_SEGMENTS = [
  [0.108, 0.091, 0.9, 0.091],
  [0.108, 0.838, 0.9, 0.838],
  [0.108, 0.091, 0.108, 0.838],
  [0.9, 0.091, 0.9, 0.838],
  [0, 0, 0.108, 0.091],
  [1, 0, 0.9, 0.091],
  [0, 0.948, 0.108, 0.838],
  [1, 0.925, 0.9, 0.838],
];

function isReferenceFramePixel(nx, ny, brightness, variance) {
  if (brightness < 45 || variance > 35) return false;
  for (let i = 0; i < REFERENCE_FRAME_SEGMENTS.length; i += 1) {
    const segment = REFERENCE_FRAME_SEGMENTS[i];
    if (distanceToSegment(nx, ny, segment[0], segment[1], segment[2], segment[3]) < 0.0055) {
      return true;
    }
  }
  return false;
}

function classifyBouquetPixel(r, g, b, nx, ny) {
  const brightness = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const variance = Math.max(r, g, b) - Math.min(r, g, b);
  if (isReferenceFramePixel(nx, ny, brightness, variance)) return null;

  const flowerRadial = Math.hypot((nx - 0.5) / 0.5, (ny - 0.43) / 0.36);
  const inFlowerMass = flowerRadial < 1.12 && ny < 0.76;
  const stemHalfWidth = Math.max(0.105, 0.235 - Math.max(0, ny - 0.64) * 0.34);
  const inStemMass = ny > 0.62 && ny < 0.985 && Math.abs(nx - 0.5) < stemHalfWidth;
  const isWhite = inFlowerMass && brightness > 142 && variance < 62;
  const isPink = inFlowerMass && r > 70 && r > g * 1.035 && r > b * 0.96;
  const isGreen = g > 43 && g > b * 1.06 && g > r * 0.78 && variance > 10;
  const isStem = inStemMass && brightness > 28 && variance > 8
    && (g > b * 1.02 || r > b * 1.08);
  const isBranch = ny < 0.78 && brightness > 38 && variance > 18
    && (r > g * 1.04 || g > r * 0.84);

  if (isWhite) return { type: "white", brightness, radial: flowerRadial };
  if (isPink) return { type: "pink", brightness, radial: flowerRadial };
  if (isStem) return { type: "stem", brightness, radial: 0.6 };
  if (isGreen && (inFlowerMass || inStemMass || brightness > 52)) {
    return { type: "green", brightness, radial: flowerRadial };
  }
  if (isBranch) return { type: "branch", brightness, radial: flowerRadial };
  return null;
}

function enhanceSampleColor(r, g, b, type, clarity) {
  let red = Math.pow(r / 255, 0.82);
  let green = Math.pow(g / 255, 0.82);
  let blue = Math.pow(b / 255, 0.82);
  const luma = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  red = luma + (red - luma) * 1.12;
  green = luma + (green - luma) * 1.12;
  blue = luma + (blue - luma) * 1.12;
  red = (red - 0.5) * 1.08 + 0.5;
  green = (green - 0.5) * 1.08 + 0.5;
  blue = (blue - 0.5) * 1.08 + 0.5;

  const categoryBoost = type === "white" ? 1.2
    : type === "pink" ? 1.15
      : type === "stem" ? 1.1
        : type === "green" ? 0.96
          : 0.93;
  const focusBoost = 0.91 + clarity * 0.13;
  if (type === "stem") {
    const stemLuma = (red * 0.2126 + green * 0.7152 + blue * 0.0722) * categoryBoost * focusBoost;
    const stemLift = 0.24 / Math.max(0.01, stemLuma);
    if (stemLift > 1) {
      red *= stemLift;
      green *= stemLift;
      blue *= stemLift;
    }
  }
  return {
    r: srgbToLinear(Math.min(1, Math.max(0, red * categoryBoost * focusBoost)) * 255),
    g: srgbToLinear(Math.min(1, Math.max(0, green * categoryBoost * focusBoost)) * 255),
    b: srgbToLinear(Math.min(1, Math.max(0, blue * categoryBoost * focusBoost)) * 255),
  };
}

function nearestHotspot(nx, ny, type) {
  if (type !== "pink" && type !== "white") return -1;
  let nearest = -1;
  let nearestDistance = Infinity;
  for (let i = 0; i < FLOWER_HOTSPOTS.length; i += 1) {
    const hotspot = FLOWER_HOTSPOTS[i];
    const distance = Math.hypot(nx - hotspot.x, ny - hotspot.y);
    if (distance < hotspot.radius * 1.2 && distance < nearestDistance) {
      nearest = i;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function sampleContinuousBouquet(image) {
  const profile = samplingProfile();
  const canvas = document.createElement("canvas");
  const aspect = image.naturalWidth / image.naturalHeight || 1;
  canvas.width = profile.imageWidth;
  canvas.height = Math.round(profile.imageWidth / aspect);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  const scale = CONFIG.bouquetHeight / height;
  const random = createSeededRandom(642731);
  const samples = [];

  for (let y = 0; y < height; y += 1) {
    const ny = y / Math.max(1, height - 1);
    for (let x = 0; x < width; x += 1) {
      const nx = x / Math.max(1, width - 1);
      const index = (y * width + x) * 4;
      if (data[index + 3] < 24) continue;
      const classification = classifyBouquetPixel(data[index], data[index + 1], data[index + 2], nx, ny);
      if (!classification) continue;

      const { type, brightness, radial } = classification;
      const clarity = type === "stem"
        ? 0.48
        : Math.max(0, Math.min(1, 1 - radial * 0.72));
      const color = enhanceSampleColor(data[index], data[index + 1], data[index + 2], type, clarity);
      const sizeBase = type === "white" ? 1.25
        : type === "pink" ? (brightness > 158 ? 1.15 : 1)
          : type === "stem" ? 0.88
            : type === "green" ? 0.82
              : 0.76;
      const opacityBase = type === "white" ? 0.92
        : type === "pink" ? 0.76 + clarity * 0.2
          : type === "stem" ? 0.8
            : type === "green" ? 0.6 + clarity * 0.12
              : 0.48;
      const weight = type === "white" ? 1.6
        : type === "pink" ? 1.25 + clarity * 0.35
          : type === "stem" ? 1.12
            : type === "green" ? 0.88
              : 0.62;
      const depth = clarity * 0.18
        + (type === "white" ? 0.13 : type === "pink" ? 0.07 : type === "stem" ? -0.14 : -0.05)
        + (random() - 0.5) * 0.06;
      const worldX = (x - width * 0.5) * scale + (random() - 0.5) * scale * 0.62;
      const worldY = -(y - height * 0.5) * scale + (random() - 0.5) * scale * 0.62;

      samples.push({
        x: worldX,
        y: worldY,
        z: depth,
        r: color.r,
        g: color.g,
        b: color.b,
        size: sizeBase * (0.9 + clarity * 0.14) * (0.9 + random() * 0.2),
        opacity: opacityBase * (0.88 + random() * 0.12),
        wander: 0.28 + (1 - clarity) * 0.72,
        hotspot: nearestHotspot(nx, ny, type),
        highlight: (type === "white" && random() < 0.08)
          || (type === "pink" && brightness > 175 && random() < 0.025),
        centerX: worldX,
        centerY: worldY,
        centerZ: depth,
        flowerPhase: -1,
        priority: random() ** (1 / weight),
      });
    }
  }

  const candidateCount = samples.length;
  if (candidateCount > profile.maxParticles) {
    samples.sort((a, b) => b.priority - a.priority);
    samples.length = profile.maxParticles;
  }
  samples.imageAspect = width / height;
  console.log("sampling resolution:", width, "x", height);
  console.log("valid pixel candidates:", candidateCount);
  console.log("generated particle count:", samples.length);
  return samples;
}

// Particle geometry
let particleState = null;

function createParticles(samples) {
  const count = samples.length;
  const viewportParticleScale = window.innerWidth < 768 ? 1.26 : window.innerWidth < 1024 ? 1.1 : 1;
  const positions = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const opacities = new Float32Array(count);
  const wander = new Float32Array(count);
  const hotspots = new Float32Array(count);
  const highlights = new Float32Array(count);
  const flowerCenters = new Float32Array(count * 3);
  const flowerPhases = new Float32Array(count);
  const seeds = new Float32Array(count);
  let highlightCount = 0;

  for (let i = 0; i < count; i += 1) {
    const index = i * 3;
    const sample = samples[i];
    const targetAngle = Math.atan2(sample.y, sample.x);
    const layer = i % 6;
    const radius = 2.25 + Math.random() * 2.45 + layer * 0.08;
    const angle = targetAngle + radius * 0.68 + Math.random() * 1.5;
    positions[index] = Math.cos(angle) * radius;
    positions[index + 1] = sample.y * 0.16 + Math.sin(angle * 1.27) * radius * 0.55;
    positions[index + 2] = Math.sin(angle) * (2.1 + layer * 0.4) + (Math.random() - 0.5) * 2;
    targets[index] = sample.x;
    targets[index + 1] = sample.y;
    targets[index + 2] = sample.z;
    colors[index] = sample.r;
    colors[index + 1] = sample.g;
    colors[index + 2] = sample.b;
    sizes[i] = sample.size * (0.76 + Math.random() * 0.55);
    opacities[i] = sample.opacity * (0.82 + Math.random() * 0.18);
    wander[i] = sample.wander;
    hotspots[i] = sample.hotspot;
    highlights[i] = sample.highlight ? 1 : 0;
    flowerCenters[index] = sample.centerX;
    flowerCenters[index + 1] = sample.centerY;
    flowerCenters[index + 2] = sample.centerZ;
    flowerPhases[i] = sample.flowerPhase;
    if (sample.highlight) highlightCount += 1;
    seeds[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));
  geometry.setAttribute("aHotspot", new THREE.BufferAttribute(hotspots, 1));
  geometry.setAttribute("aHighlight", new THREE.BufferAttribute(highlights, 1));
  geometry.computeBoundingSphere();

  const highlight = new THREE.Points(
    geometry,
    createPointMaterial({
      pointSize: CONFIG.highlightParticleSize * viewportParticleScale,
      opacity: 0.18,
      vertexColors: true,
      pulse: true,
      highlightOnly: true,
    }),
  );
  highlight.frustumCulled = false;
  highlight.renderOrder = 0;
  bouquetGroup.add(highlight);

  const points = new THREE.Points(
    geometry,
    createPointMaterial({
      pointSize: CONFIG.particleSize * viewportParticleScale,
      opacity: 0.96,
      vertexColors: true,
      pulse: true,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 1;
  bouquetGroup.add(points);

  particleState = {
    count,
    geometry,
    points,
    highlight,
    positions,
    targets,
    velocities,
    wander,
    hotspots,
    flowerCenters,
    flowerPhases,
    seeds,
    imageAspect: samples.imageAspect,
    startedAt: performance.now(),
    pulseHotspot: -1,
    pulseStartedAt: 0,
    pulseUntil: 0,
  };

  console.log("particle count:", count);
  console.log("highlight particle count:", highlightCount);
  loadingElement.classList.add("hidden");
}

const image = new Image();
image.decoding = "async";
image.addEventListener("load", () => {
  console.log("bouquet loaded");
  createParticles(sampleContinuousBouquet(image));
});
image.addEventListener("error", () => {
  console.error("bouquet.png failed to load");
  loadingElement.textContent = "bouquet image unavailable";
});
image.src = "./assets/bouquet.png";

// Pointer interaction
const pointer = new THREE.Vector2(2, 2);
const raycaster = new THREE.Raycaster();
const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const pointerWorld = new THREE.Vector3();
const pointerLocal = new THREE.Vector3(999, 999, 0);
const hotspotPoint = new THREE.Vector3();
const hotspotLeft = new THREE.Vector3();
const hotspotRight = new THREE.Vector3();
let pointerActive = false;
let interactionForceScale = 1;
let activePointerId = null;
let pointerDownX = 0;
let pointerDownY = 0;
let pointerDownTime = 0;

function updatePointer(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (raycaster.ray.intersectPlane(interactionPlane, pointerWorld)) {
    bouquetGroup.updateMatrixWorld(true);
    pointerLocal.copy(pointerWorld);
    bouquetGroup.worldToLocal(pointerLocal);
    pointerActive = true;
  }
}

function showTextMessage(text, duration = 2800, variant = "") {
  window.clearTimeout(messageTimer);
  messageText.textContent = text;
  messageElement.classList.toggle("complete", variant === "complete");
  messageElement.classList.add("visible");
  messageTimer = window.setTimeout(() => {
    messageElement.classList.remove("visible", "complete");
  }, duration);
}

function burstTapHearts(clientX, clientY) {
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement("span");
    const angle = -Math.PI * (0.18 + Math.random() * 0.64);
    const distance = 22 + Math.random() * 28;
    heart.className = "tap-heart";
    heart.textContent = Math.random() < 0.22 ? "♥" : "♡";
    heart.setAttribute("aria-hidden", "true");
    heart.style.left = `${clientX + (Math.random() - 0.5) * 10}px`;
    heart.style.top = `${clientY + (Math.random() - 0.5) * 8}px`;
    heart.style.setProperty("--heart-x", `${Math.cos(angle) * distance}px`);
    heart.style.setProperty("--heart-y", `${Math.sin(angle) * distance}px`);
    heart.style.setProperty("--heart-size", `${7 + Math.random() * 4}px`);
    heart.style.setProperty("--heart-rotation", `${-18 + Math.random() * 36}deg`);
    heart.style.setProperty("--heart-duration", `${720 + Math.random() * 180}ms`);
    document.body.append(heart);
    window.setTimeout(() => heart.remove(), 950);
  }
}

function createCompletionPetals(clientX, clientY) {
  for (let i = 0; i < 7; i += 1) {
    const petal = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 38 + Math.random() * 58;
    petal.className = "completion-petal";
    petal.setAttribute("aria-hidden", "true");
    petal.style.left = `${clientX + (Math.random() - 0.5) * 34}px`;
    petal.style.top = `${clientY + (Math.random() - 0.5) * 28}px`;
    petal.style.setProperty("--petal-x", `${Math.cos(angle) * distance}px`);
    petal.style.setProperty("--petal-y", `${Math.sin(angle) * distance - 20}px`);
    petal.style.setProperty("--petal-rotation", `${Math.random() * 160}deg`);
    petal.style.setProperty("--petal-duration", `${1150 + Math.random() * 420}ms`);
    document.body.append(petal);
    window.setTimeout(() => petal.remove(), 1750);
  }
}

function showMessage(index, clientX, clientY) {
  const justCompleted = discoverFlower(index);
  burstTapHearts(clientX, clientY);
  if (justCompleted) {
    createCompletionPetals(clientX, clientY);
    showTextMessage("36 朵花都被你找到了。\n愿所有温柔，都在此刻为你盛开。", 5000, "complete");
  } else {
    showTextMessage(FLOWER_HOTSPOTS[index].message);
  }
}

function resetFlowerCollection() {
  discoveredFlowers.clear();
  completionCelebrated = false;
  updateFlowerProgress();
  try {
    localStorage.removeItem(DISCOVERY_STORAGE_KEY);
    localStorage.removeItem(COMPLETION_STORAGE_KEY);
    localStorage.removeItem("openedFlowers");
  } catch {
    // The visible state still resets when storage is unavailable.
  }
  showTextMessage("已经从第一朵花重新开始。", 2200);
}

resetCollectionButton.addEventListener("click", resetFlowerCollection);

function showSharedDedication() {
  const { to, from, message } = readShareParameters();
  if (!to && !message) return;
  const lines = [];
  if (to) lines.push(`To ${to}`);
  lines.push(message || "送你一束用代码生成的花。");
  if (from) lines.push(`— ${from}`);
  showTextMessage(lines.join("\n"), 4500);
}

function findTappedHotspot(clientX, clientY, pointerType) {
  if (!particleState) return -1;
  const worldWidth = CONFIG.bouquetHeight * particleState.imageAspect;
  bouquetGroup.updateMatrixWorld(true);
  hotspotLeft.set(-worldWidth / 2, 0, 0);
  hotspotRight.set(worldWidth / 2, 0, 0);
  bouquetGroup.localToWorld(hotspotLeft);
  bouquetGroup.localToWorld(hotspotRight);
  hotspotLeft.project(camera);
  hotspotRight.project(camera);
  const renderedWidth = Math.abs(hotspotRight.x - hotspotLeft.x) * window.innerWidth * 0.5;
  const touchScale = pointerType === "mouse" ? 1 : 1.3;
  let nearest = -1;
  let nearestDistance = Infinity;

  for (let i = 0; i < FLOWER_HOTSPOTS.length; i += 1) {
    const hotspot = FLOWER_HOTSPOTS[i];
    hotspotPoint.set(
      (hotspot.x - 0.5) * worldWidth,
      -(hotspot.y - 0.5) * CONFIG.bouquetHeight,
      0.18,
    );
    bouquetGroup.localToWorld(hotspotPoint);
    hotspotPoint.project(camera);
    const screenX = (hotspotPoint.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (-hotspotPoint.y * 0.5 + 0.5) * window.innerHeight;
    const distance = Math.hypot(clientX - screenX, clientY - screenY);
    const hitRadius = Math.max(pointerType === "mouse" ? 11 : 18, hotspot.radius * renderedWidth * touchScale);
    if (distance <= hitRadius && distance < nearestDistance) {
      nearest = i;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function pulseHotspot(index, now) {
  if (!particleState) return;
  const { count, hotspots, targets, velocities, imageAspect } = particleState;
  const hotspot = FLOWER_HOTSPOTS[index];
  const centerX = (hotspot.x - 0.5) * CONFIG.bouquetHeight * imageAspect;
  const centerY = -(hotspot.y - 0.5) * CONFIG.bouquetHeight;
  particleState.pulseHotspot = index;
  particleState.pulseStartedAt = now;
  particleState.pulseUntil = now + 760;

  for (let i = 0; i < count; i += 1) {
    if (hotspots[i] !== index) continue;
    const offset = i * 3;
    const dx = targets[offset] - centerX;
    const dy = targets[offset + 1] - centerY;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = 0.0007 + Math.random() * 0.001;
    velocities[offset] += (dx / length) * force;
    velocities[offset + 1] += (dy / length) * force;
    velocities[offset + 2] += (Math.random() - 0.5) * force;
  }
}

function disturbLocalArea() {
  if (!particleState) return;
  const { count, positions, velocities } = particleState;
  const radius = 0.85;
  const radiusSquared = radius * radius;

  for (let i = 0; i < count; i += 1) {
    const offset = i * 3;
    const dx = positions[offset] - pointerLocal.x;
    const dy = positions[offset + 1] - pointerLocal.y;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared >= radiusSquared || distanceSquared < 0.0001) continue;
    const distance = Math.sqrt(distanceSquared);
    const force = (1 - distance / radius) * 0.022;
    velocities[offset] += (dx / distance) * force;
    velocities[offset + 1] += (dy / distance) * force;
    velocities[offset + 2] += (Math.random() - 0.5) * force * 0.7;
  }
}

function handleTap(event) {
  const hotspot = findTappedHotspot(event.clientX, event.clientY, event.pointerType);
  if (hotspot >= 0) {
    showMessage(hotspot, event.clientX, event.clientY);
    pulseHotspot(hotspot, performance.now());
  } else {
    disturbLocalArea();
  }
}

renderer.domElement.addEventListener("pointerdown", (event) => {
  if (activePointerId !== null) return;
  activePointerId = event.pointerId;
  pointerDownX = event.clientX;
  pointerDownY = event.clientY;
  pointerDownTime = performance.now();
  interactionForceScale = event.pointerType === "mouse" ? 1 : 0.48;
  updatePointer(event);
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (event.pointerType === "mouse" || event.pointerId === activePointerId) {
    interactionForceScale = event.pointerType === "mouse" ? 1 : 0.48;
    updatePointer(event);
  }
}, { passive: true });

renderer.domElement.addEventListener("pointerup", (event) => {
  if (event.pointerId !== activePointerId) return;
  const distance = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
  const elapsed = performance.now() - pointerDownTime;
  updatePointer(event);
  const tapDistance = event.pointerType === "mouse" ? 8 : 14;
  if (distance < tapDistance && elapsed < 550) handleTap(event);
  if (event.pointerType !== "mouse") pointerActive = false;
  activePointerId = null;
});

renderer.domElement.addEventListener("pointercancel", (event) => {
  if (event.pointerId === activePointerId) activePointerId = null;
  if (event.pointerType !== "mouse") pointerActive = false;
});

renderer.domElement.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") {
    pointerActive = false;
    pointer.set(2, 2);
  }
});

// Animation
function smoothstep(value) {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

let previousTime = performance.now();
let responsiveScaleX = 1;

function updateParticles(time, frameScale) {
  if (!particleState) return;
  const {
    count,
    geometry,
    positions,
    targets,
    velocities,
    wander,
    flowerCenters,
    flowerPhases,
    seeds,
    startedAt,
    pulseHotspot: activePulse,
    pulseStartedAt,
    pulseUntil,
  } = particleState;
  const intro = smoothstep((time - startedAt) / (CONFIG.introDuration * 1000));
  if (intro > 0.82 && !hintElement.classList.contains("visible")) {
    hintElement.classList.add("visible");
  }
  if (intro > 0.94 && !dedicationShown) {
    dedicationShown = true;
    showSharedDedication();
  }
  const spring = CONFIG.spring * (0.28 + intro * 0.72);
  const damping = CONFIG.damping ** frameScale;
  const settled = smoothstep((intro - 0.5) / 0.5);
  const settleLock = Math.min(0.16, smoothstep((intro - 0.88) / 0.12) * 0.075 * frameScale);
  const pointerRadiusSquared = CONFIG.pointerRadius * CONFIG.pointerRadius;
  const pulseProgress = Math.max(0, Math.min(1, (time - pulseStartedAt) / Math.max(1, pulseUntil - pulseStartedAt)));
  const pulseStrength = time < pulseUntil ? Math.sin(pulseProgress * Math.PI) : 0;
  particleState.points.material.uniforms.uPulseHotspot.value = activePulse;
  particleState.points.material.uniforms.uPulseStrength.value = pulseStrength;
  particleState.highlight.material.uniforms.uPulseHotspot.value = activePulse;
  particleState.highlight.material.uniforms.uPulseStrength.value = pulseStrength;
  particleState.highlight.material.uniforms.uOpacity.value = 0.18 + Math.sin(time * 0.0014) * 0.022;

  for (let i = 0; i < count; i += 1) {
    const offset = i * 3;
    let targetX = targets[offset];
    let targetY = targets[offset + 1];
    let targetZ = targets[offset + 2];
    if (flowerPhases[i] >= 0) {
      const bloom = 1 + Math.sin(time * 0.00115 + flowerPhases[i]) * 0.012 * settled;
      targetX = flowerCenters[offset] + (targetX - flowerCenters[offset]) * bloom;
      targetY = flowerCenters[offset + 1] + (targetY - flowerCenters[offset + 1]) * bloom;
      targetZ = flowerCenters[offset + 2] + (targetZ - flowerCenters[offset + 2]) * bloom;
    }
    velocities[offset] += (targetX - positions[offset]) * spring * frameScale;
    velocities[offset + 1] += (targetY - positions[offset + 1]) * spring * frameScale;
    velocities[offset + 2] += (targetZ - positions[offset + 2]) * spring * frameScale;

    if (pointerActive && intro > 0.62) {
      const dx = positions[offset] - pointerLocal.x;
      const dy = positions[offset + 1] - pointerLocal.y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared < pointerRadiusSquared && distanceSquared > 0.0001) {
        const distance = Math.sqrt(distanceSquared);
        const force = (1 - distance / CONFIG.pointerRadius)
          * CONFIG.pointerForce
          * interactionForceScale
          * frameScale;
        velocities[offset] += (dx / distance) * force;
        velocities[offset + 1] += (dy / distance) * force;
      }
    }

    const drift = 0.000026 * wander[i] * intro;
    velocities[offset] += Math.sin(time * 0.00055 + seeds[i]) * drift;
    velocities[offset + 1] += Math.cos(time * 0.00047 + seeds[i]) * drift;
    velocities[offset] *= damping;
    velocities[offset + 1] *= damping;
    velocities[offset + 2] *= damping;
    positions[offset] += velocities[offset] * frameScale;
    positions[offset + 1] += velocities[offset + 1] * frameScale;
    positions[offset + 2] += velocities[offset + 2] * frameScale;
    positions[offset] += (targetX - positions[offset]) * settleLock;
    positions[offset + 1] += (targetY - positions[offset + 1]) * settleLock;
    positions[offset + 2] += (targetZ - positions[offset + 2]) * settleLock;
  }

  geometry.attributes.position.needsUpdate = true;
  const breath = 1 + Math.sin(time * 0.00105) * 0.011 * settled;
  bouquetGroup.scale.set(breath * responsiveScaleX, breath, breath);
  bouquetGroup.position.y = Math.sin(time * 0.0005) * 0.065 * settled;
  bouquetGroup.rotation.y = Math.sin(time * 0.00022) * 0.045 * settled;
  bouquetGroup.rotation.x = Math.cos(time * 0.00017) * 0.009 * settled;
}

function animate(time) {
  requestAnimationFrame(animate);
  const delta = Math.min(0.033, Math.max(0.001, (time - previousTime) / 1000));
  previousTime = time;
  const frameScale = delta * 60;
  updateParticles(time, frameScale);
  backgroundParticles.rotation.y += 0.000018 * frameScale;
  spatialFrame.rotation.y = Math.sin(time * 0.00008) * 0.012;
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

// Responsive camera and frame
function resize() {
  const width = window.innerWidth;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const desiredHeight = isMobile ? 0.62 : isTablet ? 0.66 : 0.72;
  camera.aspect = width / window.innerHeight;
  camera.position.z = CONFIG.bouquetHeight
    / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * desiredHeight);
  responsiveScaleX = isMobile ? 0.68 : isTablet ? 0.92 : 1;
  spatialFrame.scale.x = isMobile ? 0.68 : isTablet ? 0.84 : 1;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, window.innerHeight);

  const pixelRatio = renderer.getPixelRatio();
  backgroundParticles.material.uniforms.uPixelRatio.value = pixelRatio;
  if (particleState) {
    particleState.points.material.uniforms.uPixelRatio.value = pixelRatio;
    particleState.highlight.material.uniforms.uPixelRatio.value = pixelRatio;
  }
}

window.addEventListener("resize", resize);
window.addEventListener("orientationchange", () => window.setTimeout(resize, 120));
resize();
