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
let currentView = "menu";
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
function getCurrentSheetProject() {
  return projects[currentProject]?.sheet || currentProject;
}

function normalize(val) {
  return String(val || "").trim().toLowerCase();
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
  hit.setAttribute("pointer-events", "all");
  hit.style.pointerEvents = "all";
  hit.style.cursor = "pointer";

  hit.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Квартира:", flatId);
    showFlatCard(flatId);
  });

  flatEl.parentNode.appendChild(hit);
}

// =====================
// ВЫБОР ПРОЕКТА
// =====================
function selectProject(project) {
  if (!projects[project]) {
    console.error("Нет проекта:", project);
    return;
  }
  currentView = "blocks";
  currentProject = project;
  currentBlock = null;
  currentFloor = projects[project].floorStart;

  hideFlatCard();

  const mainMenu = document.getElementById("mainMenu");
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
// ЗАГРУЗКА SVG
// =====================
function loadSVG(src) {
  console.log("Загрузка:", src);
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

  const start = projects[currentProject]?.floorStart ?? 1;
  const end = projects[currentProject]?.floorEnd ?? 16;

  for (let i = start; i <= end; i++) {
    const btn = document.createElement("button");
    btn.className = "floor-btn";

    if (i === currentFloor) {
      btn.classList.add("active");
    }

    btn.textContent = i + " этаж";

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
// КОГДА SVG ЗАГРУЗИЛСЯ
// =====================
plan.onload = function () {
  const svg = plan.contentDocument;
  if (!svg) return;

  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.documentElement.appendChild(defs);
  }

  if (!svg.querySelector("#soldPattern")) {
    const soldPattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    soldPattern.setAttribute("id", "soldPattern");
    soldPattern.setAttribute("patternUnits", "userSpaceOnUse");
    soldPattern.setAttribute("patternTransform", "rotate(45)");
    soldPattern.setAttribute("width", "8");
    soldPattern.setAttribute("height", "8");

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", "0");
    line.setAttribute("y2", "8");
    line.setAttribute("stroke", "#ffffff");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("opacity", "0.65");

    soldPattern.appendChild(line);
    defs.appendChild(soldPattern);
  }

  console.log("SVG загружен:", plan.data);

  // =====================
  // ЕСЛИ ВНУТРИ БЛОКА → КВАРТИРЫ
  // =====================
  if (currentBlock) {
    const flatElements = Array.from(svg.querySelectorAll('[id^="flat"]'))
      .filter(el => /^flat\d+$/i.test(el.id));

    flatElements.forEach(el => {
      const id = el.id;
      el.style.cursor = "pointer";

      removeIfExists(svg, id + "_sold_bg");
      removeIfExists(svg, id + "_sold_pattern");
      removeIfExists(svg, id + "_hit");

      const row = findFlatRow(id);
      const isSold = !!(row && (normalize(row.contract) || normalize(row.client)));

      if (isSold) {
        const bg = el.cloneNode(true);
        bg.removeAttribute("style");
        bg.removeAttribute("stroke");
        bg.id = id + "_sold_bg";
        bg.setAttribute("fill", "rgba(255,255,255,0.22)");
        bg.setAttribute("pointer-events", "none");
        bg.style.pointerEvents = "none";

        const patternLayer = el.cloneNode(true);
        patternLayer.removeAttribute("style");
        patternLayer.removeAttribute("stroke");
        patternLayer.id = id + "_sold_pattern";
        patternLayer.setAttribute("fill", "url(#soldPattern)");
        patternLayer.setAttribute("pointer-events", "none");
        patternLayer.style.pointerEvents = "none";
        patternLayer.style.opacity = "0.85";

        el.parentNode.appendChild(bg);
        el.parentNode.appendChild(patternLayer);
      }

      addFlatHitArea(svg, el, id);
    });

    return;
  }

  // =====================
  // ЕСЛИ В ПРОЕКТЕ → БЛОКИ
  // =====================
  const blocks = ["b1", "b2", "b3", "b4", "b5", "b6"];

  blocks.forEach(id => {
    const el = svg.getElementById(id);
    if (!el) return;

    el.style.cursor = "pointer";

    el.onclick = () => {
      console.log("Блок:", id);
      currentView = "flats";
      currentBlock = id;
      hideFlatCard();
      showFloors();

      const fileName = getBlockSvgFile(currentProject, id);
      loadSVG(fileName);
      backBtn.style.display = "block";
    };
  });
};

// =====================
// НАЗАД
// =====================
backBtn.onclick = function () {

  // ЕСЛИ МЫ ВНУТРИ БЛОКА
  backBtn.onclick = function () {

  // 🟢 из квартир → к блокам
  if (currentView === "flats") {
    currentView = "blocks";

    currentBlock = null;
    hideFlatCard();
    floorPanel.style.display = "none";

    loadSVG(projects[currentProject].svg);
    return;
  }

  // 🔵 из блоков → в главное меню
  if (currentView === "blocks") {
    currentView = "menu";

    hideFlatCard();

    plan.style.display = "none";
    floorPanel.style.display = "none";

    const mainMenu = document.getElementById("mainMenu");
    if (mainMenu) {
      mainMenu.style.display = "flex";
    }

    backBtn.style.display = "none";
    return;
  }
};

// =====================
// КАРТОЧКА
// =====================
function showFlatCard(flatId) {
  console.log("ИЩЕМ:", flatId);

  if (!isDataLoaded) {
    console.warn("Данные ещё не загрузились");
    return;
  }

  const row = findFlatRow(flatId);

  if (!row) {
    console.warn("Не найдено в таблице:", {
      project: getCurrentSheetProject(),
      block: currentBlock,
      floor: currentFloor,
      flat: flatId
    });
    return;
  }

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
  const mainMenu = document.getElementById("mainMenu");

  if (!splash) return;

  splash.style.transition = "opacity 1s";
  splash.style.opacity = "0";

  setTimeout(() => {
    splash.style.display = "none";
    if (mainMenu && mainMenu.style.display === "none") {
      mainMenu.style.display = "flex";
    }
  }, 1000);
}

// не ждём window.load бесконечно
setTimeout(hideSplash, 6000);

// =====================
// SERVICE WORKER
// =====================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}