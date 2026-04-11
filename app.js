// =====================
// GOOGLE SHEETS
// =====================
let sheetData = [];
let isDataLoaded = false;

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
// СОСТОЯНИЕ
// =====================
let selectedFlat = null;
let currentView = "projects";
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

function removeIfExists(root, id) {
  const el = root.getElementById(id);
  if (el) el.remove();
}

function addFlatHitArea(svg, flatEl, flatId) {
  removeIfExists(svg, flatId + "_hit");

  const hit = flatEl.cloneNode(true);
  hit.removeAttribute("style");
  hit.removeAttribute("stroke");
  hit.id = flatId + "_hit";

  hit.setAttribute("fill", "rgba(0,0,0,0.001)");
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

// =====================
// ВЫБОР ПРОЕКТА
// =====================
function selectProject(project) {
  if (!projects[project]) return;

  currentView = "blocks";
  currentProject = project;
  currentBlock = null;
  currentFloor = projects[project].floorStart;

  hideFlatCard();

  if (mainMenu) mainMenu.style.display = "none";
  if (plan) plan.style.display = "block";
  if (floorPanel) floorPanel.style.display = "none";
  if (backBtn) backBtn.style.display = "block";

  loadSVG(projects[project].svg);
}

window.selectProject = selectProject;

// =====================
// SVG
// =====================
function loadSVG(src) {
  plan.data = "";

  setTimeout(() => {
    plan.data = src + "?t=" + Date.now();

    // Ждём загрузку SVG
    plan.onload = () => {
      const svg = plan.contentDocument;

      if (!svg) return;

      //  ШТРИХОВКА
      sheetData.forEach(row => {
        if (row.contract) {
          markSoldFlat(svg, row.flat);
        }
      });

      //   клики 
      if (typeof initSVG === "function") {
        initSVG(svg);
      }
    };

  }, 100);
}
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

    if (i === currentFloor) btn.classList.add("active");

    btn.onclick = () => {
      currentFloor = i;
      showFloors();

      if (!currentBlock) return;

      hideFlatCard();
      loadSVG(getBlockSvgFile(currentProject, currentBlock));
    };

    floorsContainer.appendChild(btn);
  }

  floorPanel.style.display = "block";
}

// =====================
// SVG LOAD
// =====================
plan.onload = function () {
  const svg = plan.contentDocument;
  if (!svg) return;

sheetData.forEach(row => {
    if (row.contract) {
      markSoldFlat(svg, "flat" + row.flat);
    }
  });

  if (currentBlock) {
    const flats = svg.querySelectorAll('[id^="flat"]');

    flats.forEach(el => {
      const id = el.id;
      addFlatHitArea(svg, el, id);
    });

    return;
  }

  ["b1","b2","b3","b4","b5","b6"].forEach(id => {
    const el = svg.getElementById(id);
    if (!el) return;

    el.style.cursor = "pointer";

    el.onclick = () => {
      currentView = "flats";
      currentBlock = id;

      hideFlatCard();
      showFloors();

      loadSVG(getBlockSvgFile(currentProject, id));
    };
  });
};

// =====================
// НАЗАД
// =====================
backBtn.onclick = function () {

  if (currentView === "flats") {
    currentView = "blocks";
    currentBlock = null;

    hideFlatCard();
    floorPanel.style.display = "none";

    loadSVG(projects[currentProject].svg);
    return;
  }

  if (currentView === "blocks") {
    currentView = "projects";

    plan.style.display = "none";
    floorPanel.style.display = "none";
    mainMenu.style.display = "flex";

    backBtn.style.display = "none";
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
  flatCard.classList.remove("show");
}
function highlightFlat(svg, flatId) {

  if (selectedFlat) {
    const old = svg.getElementById(selectedFlat);
    if (old) {
      old.style.filter = "";
      old.style.stroke = "";
      old.style.strokeWidth = "";  // ✅ теперь внутри
    }
  }

  const el = svg.getElementById(flatId);
  if (!el) return;

  el.style.filter = "drop-shadow(0 0 12px red)";
  el.style.stroke = "#ff0000";
  el.style.strokeWidth = "2";

  selectedFlat = flatId;
}
 
function markSoldFlat(svg, flatId) {
  const el = svg.getElementById(flatId);
  if (!el) return;

  // если уже есть штрих — не дублируем
  if (svg.getElementById(flatId + "_sold")) return;

  const sold = el.cloneNode(true);

  sold.removeAttribute("style");
  sold.removeAttribute("stroke");

  sold.setAttribute("fill", "url(#soldPattern)");
  sold.style.pointerEvents = "none"; // чтобы клики не ломались
  sold.style.opacity = "0.8";

  sold.id = flatId + "_sold";

  el.parentNode.appendChild(sold);
}

// =====================
// SPLASH
// =====================
function hideSplash() {
  const splash = document.getElementById("splash");

  splash.style.opacity = "0";
  setTimeout(() => {
    splash.style.display = "none";
    mainMenu.style.display = "flex";
  }, 1000);
}

setTimeout(hideSplash, 6000);

// =====================
// SERVICE WORKER
// =====================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}