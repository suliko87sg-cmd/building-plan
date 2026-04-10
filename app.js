// =====================
// GOOGLE SHEETS
// =====================
let sheetData = [];
let isDataLoaded = false;

fetch("https://opensheet.elk.sh/1bgxMmcENfryGLng9KZwju8zsoQaHBco-aDTmNONlQ2s/plan")
  .then(res => res.json())
  .then(data => {
    sheetData = Array.isArray(data) ? data : (data.data || []);
    isDataLoaded = true;
  });

// =====================
// СОСТОЯНИЕ
// =====================
let currentProject = "kush";
let currentBlock = null;
let currentFloor = 3;

// =====================
// ЭЛЕМЕНТЫ
// =====================
const plan = document.getElementById("plan");
const backBtn = document.getElementById("backBtn");
const flatCard = document.getElementById("flatCard");
const floorPanel = document.getElementById("floorPanel");
const floorsContainer = document.getElementById("floors");

// =====================
// ПРОЕКТЫ
// =====================
const projects = {
  kush: { svg: "blocks.svg", sheet: "blocks", floorStart: 3, floorEnd: 18 },
  buston: { svg: "bustonblocks.svg", sheet: "bustonblocks", floorStart: 1, floorEnd: 16 },
  gafurov: { svg: "gafurovblocks.svg", sheet: "gafurovblocks", floorStart: 1, floorEnd: 16 }
};

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

// =====================
// ВЫБОР ПРОЕКТА
// =====================
function selectProject(project) {
  currentProject = project;
  currentBlock = null;
  currentFloor = projects[project].floorStart;

  hideFlatCard();

  document.getElementById("mainMenu").style.display = "none";
  plan.style.display = "block";

  loadSVG(projects[project].svg);
}

window.selectProject = selectProject;

// =====================
// ЗАГРУЗКА SVG
// =====================
function loadSVG(src) {
  plan.data = "";
  setTimeout(() => {
    plan.data = src + "?t=" + Date.now();
  }, 100);
}

// =====================
// ЭТАЖИ
// =====================
function showFloors() {
  floorsContainer.innerHTML = "";

  for (let i = projects[currentProject].floorStart; i <= projects[currentProject].floorEnd; i++) {
    const btn = document.createElement("button");
    btn.className = "floor-btn";
    btn.textContent = i + " этаж";

    btn.onclick = () => {
      currentFloor = i;
      showFloors();
      loadSVG(getBlockSvgFile(currentProject, currentBlock));
    };

    floorsContainer.appendChild(btn);
  }

  floorPanel.style.display = "block";
}

// =====================
// SVG LOADED
// =====================
plan.onload = function () {
  const svg = plan.contentDocument;
  if (!svg) return;

  // pattern
  if (!svg.querySelector("#soldPattern")) {
    const defs = svg.createElementNS("http://www.w3.org/2000/svg", "defs");

    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.id = "soldPattern";
    pattern.setAttribute("patternUnits", "objectBoundingBox");
    pattern.setAttribute("patternTransform", "rotate(45)");
    pattern.setAttribute("width", "0.1");
    pattern.setAttribute("height", "0.1");

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", "0");
    line.setAttribute("y2", "5");
    line.style.stroke = "#fff";
    line.style.strokeWidth = "5";

    pattern.appendChild(line);
    defs.appendChild(pattern);
    svg.documentElement.appendChild(defs);
  }

  // =====================
  // КВАРТИРЫ
  // =====================
  if (currentBlock) {
    const flats = svg.querySelectorAll('[id^="flat"]');

    flats.forEach(el => {
      const id = el.id;

      el.style.cursor = "pointer";

      // 👉 КЛИК ВСЕГДА
      el.addEventListener("click", () => {
        showFlatCard(id);
      });

      const row = findFlatRow(id);

      if (row && (row.contract || row.client)) {
        // продано

        const bg = el.cloneNode(true);
        bg.setAttribute("fill", "rgba(255,255,255,0.25)");
        bg.setAttribute("pointer-events", "none");

        const patternLayer = el.cloneNode(true);
        patternLayer.setAttribute("fill", "url(#soldPattern)");
        patternLayer.setAttribute("pointer-events", "none");

        el.parentNode.appendChild(bg);
        el.parentNode.appendChild(patternLayer);
      }
    });

    return;
  }

  // =====================
  // БЛОКИ
  // =====================
  ["b1", "b2", "b3", "b4", "b5", "b6"].forEach(id => {
    const el = svg.getElementById(id);
    if (!el) return;

    el.style.cursor = "pointer";

    el.onclick = () => {
      currentBlock = id;
      showFloors();
      loadSVG(getBlockSvgFile(currentProject, id));
      backBtn.style.display = "block";
    };
  });
};

// =====================
// НАЗАД
// =====================
backBtn.onclick = function () {
  currentBlock = null;
  hideFlatCard();
  floorPanel.style.display = "none";
  loadSVG(projects[currentProject].svg);
  backBtn.style.display = "none";
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
  flatCard.classList.remove("show");
}

// =====================
// SW
// =====================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}