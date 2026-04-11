// =====================
// GOOGLE SHEETS
// =====================
let sheetData = [];
let isDataLoaded = false;

// =====================
// СОСТОЯНИЕ
// =====================
let currentView = "projects";
let currentProject = "kush";
let currentBlock = null;
let currentFloor = 3;
let selectedFlat = null;

// =====================
// ЭЛЕМЕНТЫ
// =====================
const plan = document.getElementById("plan");
const backBtn = document.getElementById("backBtn");
const flatCard = document.getElementById("flatCard");
const floorPanel = document.getElementById("floorPanel");
const floorsContainer = document.getElementById("floors");
const mainMenu = document.getElementById("mainMenu");

// =====================
// ПРОЕКТЫ
// =====================
const projects = {
  kush: {
    svg: "blocks.svg",
    sheet: "blocks",
    floorStart: 3,
    floorEnd: 18
  },
  buston: {
    svg: "bustonblocks.svg",
    sheet: "bustonblocks",
    floorStart: 1,
    floorEnd: 16
  },
  gafurov: {
    svg: "gafurovblocks.svg",
    sheet: "gafurovblocks",
    floorStart: 1,
    floorEnd: 16
  },
  obj4: {
    svg: null,
    sheet: "obj4",
    floorStart: 1,
    floorEnd: 16
  }
};

// =====================
// ЗАГРУЗКА ДАННЫХ
// =====================
fetch("https://opensheet.elk.sh/1bgxMmcENfryGLng9KZwju8zsoQaHBco-aDTmNONlQ2s/plan")
  .then(res => res.json())
  .then(data => {
    console.log("DATA LOADED:", data);
    sheetData = Array.isArray(data) ? data : (data.data || []);
    isDataLoaded = true;
  })
  .catch(err => {
    console.error("Ошибка загрузки данных:", err);
  });

// =====================
// ВСПОМОГАТЕЛЬНЫЕ
// =====================
function normalize(val) {
  return String(val || "").trim().toLowerCase();
}

function getCurrentSheetProject() {
  return projects[currentProject]?.sheet || currentProject;
}

function getBlockSvgFile(projectKey, blockId) {
  if (projectKey === "buston") return "buston" + blockId + ".svg";
  if (projectKey === "gafurov") return "gafurov" + blockId + ".svg";
  return blockId + ".svg";
}

function findFlatRow(flatId) {
  return sheetData.find(item =>
    normalize(item.project) === normalize(getCurrentSheetProject()) &&
    normalize(item.block) === normalize(currentBlock) &&
    normalize(item.flat) === normalize(flatId) &&
    Number(item.floor) === Number(currentFloor)
  );
}

function ensureSoldPattern(svg) {
  const root = svg.documentElement;
  if (!root) return;

  let defs = root.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    root.insertBefore(defs, root.firstChild);
  }

  if (root.querySelector("#soldPattern")) return;

  const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
  pattern.setAttribute("id", "soldPattern");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  pattern.setAttribute("width", "8");
  pattern.setAttribute("height", "8");
  pattern.setAttribute("patternTransform", "rotate(45)");

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", "0");
  line.setAttribute("y1", "0");
  line.setAttribute("x2", "0");
  line.setAttribute("y2", "8");
  line.setAttribute("stroke", "#ffffff");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("opacity", "0.7");

  pattern.appendChild(line);
  defs.appendChild(pattern);
}

function highlightFlat(svg, flatId) {
  if (selectedFlat) {
    const old = svg.getElementById(selectedFlat);
    if (old) {
      old.style.filter = "";
      old.style.stroke = "";
      old.style.strokeWidth = "";
    }
  }

  const el = svg.getElementById(flatId);
  if (!el) return;

  el.style.filter = "drop-shadow(0 0 12px red)";
  el.style.stroke = "#ff0000";
  el.style.strokeWidth = "2";

  selectedFlat = flatId;
}

function removeIfExists(svg, id) {
  const el = svg.getElementById(id);
  if (el) el.remove();
}

function addFlatHitArea(svg, flatEl, flatId) {
  removeIfExists(svg, flatId + "_hit");

  const hit = flatEl.cloneNode(true);
  hit.removeAttribute("style");
  hit.removeAttribute("stroke");
  hit.id = flatId + "_hit";

  hit.setAttribute("fill", "rgba(0,0,0,0.001)");
  hit.setAttribute("pointer-events", "all");
  hit.style.pointerEvents = "all";
  hit.style.cursor = "pointer";

  hit.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    highlightFlat(svg, flatId);
    showFlatCard(flatId);
  });

  flatEl.parentNode.appendChild(hit);
}

function applySoldFlatsForCurrentBlock(svg) {
  if (!currentBlock) return;

  const flats = svg.querySelectorAll('[id^="flat"]');

  flats.forEach(el => {
    const id = el.id;
    const row = findFlatRow(id);

    removeIfExists(svg, id + "_sold_bg");
    removeIfExists(svg, id + "_sold_pattern");
    removeIfExists(svg, id + "_hit");

    el.style.opacity = "";
    el.style.fill = "";
    el.style.stroke = "";
    el.style.strokeWidth = "";
    el.removeAttribute("fill");

    // ✅ ВОТ ТУТ продолжение, без закрытия функции
    if (row && (normalize(row.contract) || normalize(row.client))) {

      el.style.fill = "rgba(0,0,0,0.001)";
      el.setAttribute("fill", "rgba(0,0,0,0.001)");

      const bg = el.cloneNode(true);
      bg.removeAttribute("style");
      bg.setAttribute("fill", "rgba(255,255,255,0.25)");
      bg.setAttribute("pointer-events", "none");
      bg.id = id + "_sold_bg";

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

    addFlatHitArea(svg, el, id);
  });

} // ✅ ВОТ ТУТ закрывается функция
// =====================
// ВЫБОР ПРОЕКТА
// =====================
function selectProject(project) {
  if (!projects[project]) return;

  currentView = "blocks";
  currentProject = project;
  currentBlock = null;
  currentFloor = projects[project].floorStart;
  selectedFlat = null;

  hideFlatCard();

  if (mainMenu) mainMenu.style.display = "none";
  if (plan) plan.style.display = "block";
  if (floorPanel) floorPanel.style.display = "none";
  if (backBtn) backBtn.style.display = "block";

  if (!projects[project].svg) {
    alert("Пока нет проекта");
    return;
  }

  loadSVG(projects[project].svg);
}

window.selectProject = selectProject;

// =====================
// SVG LOAD
// =====================
function loadSVG(src) {
  plan.data = "";

  setTimeout(() => {
    plan.data = src + "?t=" + Date.now();
  }, 100);
}

plan.onload = function () {
  const svg = plan.contentDocument;
  if (!svg) return;

  ensureSoldPattern(svg);

  // Внутри блока: квартиры
  if (currentBlock) {
    applySoldFlatsForCurrentBlock(svg);
    return;
  }

  // В проекте: блоки
  ["b1", "b2", "b3", "b4", "b5", "b6"].forEach(id => {
    const el = svg.getElementById(id);
    if (!el) return;

    el.style.cursor = "pointer";

    el.onclick = () => {
      currentView = "flats";
      currentBlock = id;
      selectedFlat = null;

      hideFlatCard();
      showFloors();

      loadSVG(getBlockSvgFile(currentProject, id));
    };
  });
};

// =====================
// ЭТАЖИ
// =====================
function showFloors() {
  floorsContainer.innerHTML = "";

  const start = projects[currentProject]?.floorStart ?? 1;
  const end = projects[currentProject]?.floorEnd ?? 16;

  for (let i = start; i <= end; i++) {
    const btn = document.createElement("button");
    btn.className = "floor-btn";
    btn.textContent = i + " этаж";

    if (i === currentFloor) {
      btn.classList.add("active");
    }

    btn.onclick = () => {
      currentFloor = i;
      selectedFlat = null;
      hideFlatCard();
      showFloors();

      if (!currentBlock) return;

      loadSVG(getBlockSvgFile(currentProject, currentBlock));
    };

    floorsContainer.appendChild(btn);
  }

  floorPanel.style.display = "block";
}

// =====================
// НАЗАД
// =====================
backBtn.onclick = function () {
  if (currentView === "flats") {
    currentView = "blocks";
    currentBlock = null;
    selectedFlat = null;

    hideFlatCard();
    floorPanel.style.display = "none";

    loadSVG(projects[currentProject].svg);
    return;
  }

  if (currentView === "blocks") {
    currentView = "projects";
    currentBlock = null;
    selectedFlat = null;

    hideFlatCard();

    if (plan) plan.style.display = "none";
    if (floorPanel) floorPanel.style.display = "none";
    if (mainMenu) mainMenu.style.display = "flex";
    if (backBtn) backBtn.style.display = "none";
  }
};

// =====================
// КАРТОЧКА
// =====================
function showFlatCard(flatId) {
  if (!isDataLoaded) return;

  const row = findFlatRow(flatId);
  if (!row) return;

  document.getElementById("cardContract").innerText = row.contract || "";
  document.getElementById("cardArea").innerText = row.area ? row.area + " м²" : "";
  document.getElementById("cardClient").innerText = row.client || "";

  flatCard.classList.add("show");
}

function hideFlatCard() {
  if (!flatCard) return;
  flatCard.classList.remove("show");
}

window.hideFlatCard = hideFlatCard;

// =====================
// SPLASH
// =====================
function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;

  splash.style.opacity = "0";

  setTimeout(() => {
    splash.style.display = "none";
    if (mainMenu) mainMenu.style.display = "flex";
  }, 1000);
}

setTimeout(hideSplash, 6000);

// =====================
// SERVICE WORKER
// =====================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}