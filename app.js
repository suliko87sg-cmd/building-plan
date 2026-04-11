// ================== GOOGLE SHEETS ==================
let sheetData = [];

async function loadSheet() {
  const res = await fetch("https://opensheet.elk.sh/YOUR_SHEET_ID/plan");
  sheetData = await res.json();
}

// ================== STATE ==================
let currentView = "projects";
let currentProject = "kush";
let currentBlock = null;
let currentFloor = 3;
let selectedFlat = null;

// ================== ELEMENTS ==================
const plan = document.getElementById("plan");
const backBtn = document.getElementById("backBtn");
const floorPanel = document.getElementById("floorPanel");
const floorsContainer = document.getElementById("floorsContainer");

// ================== HELPERS ==================
function normalize(val) {
  return val && val.toString().trim() !== "";
}

function findFlatRow(id) {
  return sheetData.find(r => r.flat == id);
}

function removeIfExists(svg, id) {
  const el = svg.getElementById(id);
  if (el) el.remove();
}

// ================== SVG LOAD ==================
function loadSVG(src) {
  plan.data = "";
  setTimeout(() => {
    plan.data = src + "?t=" + Date.now();
  }, 50);
}

// ================== PATTERN ==================
function ensureSoldPattern(svg) {
  if (svg.getElementById("soldPattern")) return;

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
  pattern.setAttribute("id", "soldPattern");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  pattern.setAttribute("width", "8");
  pattern.setAttribute("height", "8");

  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.setAttribute("d", "M0 8 L8 0");
  line.setAttribute("stroke", "#ffffff");
  line.setAttribute("stroke-width", "1");

  pattern.appendChild(line);
  defs.appendChild(pattern);

  svg.documentElement.appendChild(defs);
}

// ================== CLICK ZONE ==================
function addFlatHitArea(svg, el, id) {
  removeIfExists(svg, id + "_hit");

  const hit = el.cloneNode(true);
  hit.removeAttribute("style");
  hit.removeAttribute("stroke");

  hit.id = id + "_hit";
  hit.setAttribute("fill", "rgba(0,0,0,0.001)");
  hit.style.pointerEvents = "all";
  hit.style.cursor = "pointer";

  hit.addEventListener("click", (e) => {
    e.stopPropagation();
    highlightFlat(svg, id);
    showFlatCard(id);
  });

  el.parentNode.appendChild(hit);
}

// ================== SOLD ==================
function applySoldFlats(svg) {
  const flats = svg.querySelectorAll('[id^="flat"]');

  flats.forEach(el => {
    const id = el.id;
    const row = findFlatRow(id);

    removeIfExists(svg, id + "_sold_bg");
    removeIfExists(svg, id + "_sold_pattern");
    removeIfExists(svg, id + "_hit");

    el.style.fill = "";
    el.removeAttribute("fill");

    if (row && (normalize(row.contract) || normalize(row.client))) {

      // прозрачный оригинал (чтобы клик работал)
      el.setAttribute("fill", "rgba(0,0,0,0.001)");

      // подложка
      const bg = el.cloneNode(true);
      bg.removeAttribute("style");
      bg.setAttribute("fill", "rgba(255,255,255,0.25)");
      bg.setAttribute("pointer-events", "none");
      bg.id = id + "_sold_bg";

      // штрих
      const pattern = el.cloneNode(true);
      pattern.removeAttribute("style");
      pattern.removeAttribute("stroke");
      pattern.setAttribute("fill", "url(#soldPattern)");
      pattern.setAttribute("pointer-events", "none");
      pattern.style.opacity = "0.8";
      pattern.id = id + "_sold_pattern";

      el.parentNode.appendChild(bg);
      el.parentNode.appendChild(pattern);
    }

    // ВСЕГДА добавляем клик
    addFlatHitArea(svg, el, id);
  });
}

// ================== HIGHLIGHT ==================
function highlightFlat(svg, id) {
  if (selectedFlat) {
    const old = svg.getElementById(selectedFlat);
    if (old) {
      old.style.stroke = "";
      old.style.strokeWidth = "";
      old.style.filter = "";
    }
  }

  const el = svg.getElementById(id);
  if (!el) return;

  el.style.stroke = "#ff0000";
  el.style.strokeWidth = "2";
  el.style.filter = "drop-shadow(0 0 10px red)";

  selectedFlat = id;
}

// ================== CARD ==================
function showFlatCard(id) {
  const row = findFlatRow(id);
  if (!row) return;

  const card = document.getElementById("flatCard");
  card.innerHTML = `
    <div>Договор: ${row.contract || ""}</div>
    <div>Площадь: ${row.area || ""} м²</div>
    <div>Клиент: ${row.client || ""}</div>
  `;
  card.classList.add("show");
}

// ================== FLOORS ==================
function showFloors() {
  floorPanel.style.display = "block";
}

// ================== SVG ONLOAD ==================
plan.onload = function () {
  const svg = plan.contentDocument;
  if (!svg) return;

  ensureSoldPattern(svg);

  if (currentBlock) {
    applySoldFlats(svg);
    return;
  }

  ["b1","b2","b3","b4","b5","b6"].forEach(id => {
    const el = svg.getElementById(id);
    if (!el) return;

    el.style.cursor = "pointer";

    el.onclick = () => {
      currentView = "flats";
      currentBlock = id;
      selectedFlat = null;

      showFloors();
      loadSVG(getBlockSvgFile(currentProject, id));
    };
  });
};