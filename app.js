// =====================
// GOOGLE SHEETS
// =====================
let sheetData = [];
let isDataLoaded = false;

async function loadSheet() {
  try {
    const res = await fetch("https://opensheet.elk.sh/1bgxMmcENfryGLng9KZwaju8zsoQaHBco-aDTmNON1Q2s/plan");

    const data = await res.json();

    console.log("DATA LOADED:", data);

    sheetData = Array.isArray(data) ? data : (data.data || []);
    isDataLoaded = true;

    // 👉 ВАЖНО
    showProjects();

  } catch (err) {
    console.error("Ошибка загрузки данных:", err);
  }
}

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
// key = то, что в selectProject(...)
// sheet = то, что у тебя в Google Sheets в колонке project
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

// =====================
// ВЫБОР ПРОЕКТА
// =====================
function selectProject(project) {
  if (!projects[project]) {
    console.error("Нет проекта:", project);
    return;
  }

  currentProject = project;
  currentBlock = null;
  currentFloor = projects[project].floorStart;

  hideFlatCard();

  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("plan").style.display = "block";
  document.getElementById("floorPanel").style.display = "none";
  document.getElementById("backBtn").style.display = "none";

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

  const defs = svg.querySelector("defs") ||
    svg.createElementNS("http://www.w3.org/2000/svg", "defs");

  if (!svg.querySelector("#soldPattern")) {
    const soldPattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    soldPattern.setAttribute("id", "soldPattern");
    soldPattern.setAttribute("patternUnits", "objectBoundingBox");
    soldPattern.setAttribute("patternTransform", "rotate(45)");
    soldPattern.setAttribute("width", "0.1");
    soldPattern.setAttribute("height", "0.1");

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", "0");
    line.setAttribute("y2", "5");
    line.style.stroke = "#ffffff";
    line.style.strokeWidth = "5.5";
    line.style.opacity = "0.5";

    soldPattern.appendChild(line);
    defs.appendChild(soldPattern);
    svg.documentElement.appendChild(defs);
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

      const row = findFlatRow(id);

      if (row && (normalize(row.contract) || normalize(row.client))) {
        console.log("ПРОДАНО:", id);

        const oldBg = svg.getElementById(id + "_sold_bg");
        const oldPattern = svg.getElementById(id + "_sold_pattern");

        if (oldBg) oldBg.remove();
        if (oldPattern) oldPattern.remove();

        el.style.fill = "none";
        el.setAttribute("fill", "none");

        // Белая полупрозрачная подложка
        const bg = el.cloneNode(true);
        bg.removeAttribute("style");
        bg.setAttribute("fill", "rgba(255,255,255,0.25)");
        bg.style.pointerEvents = "none";
        bg.id = id + "_sold_bg";

        // Штриховка
        const patternLayer = el.cloneNode(true);
        patternLayer.removeAttribute("style");
        patternLayer.removeAttribute("stroke");
        patternLayer.setAttribute("fill", "url(#soldPattern)");
        patternLayer.style.pointerEvents = "none";
        patternLayer.style.opacity = "0.8";
        patternLayer.id = id + "_sold_pattern";

        el.parentNode.appendChild(bg);
        el.parentNode.appendChild(patternLayer);
      }

      el.onclick = () => {
        console.log("Квартира:", id);
        showFlatCard(id);
      };
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
  currentBlock = null;

  hideFlatCard();
  floorPanel.style.display = "none";
  plan.data = "";

  setTimeout(() => {
    loadSVG(projects[currentProject].svg);
  }, 50);

  backBtn.style.display = "none";
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
window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (!splash) return;

    splash.style.transition = "opacity 1s";
    splash.style.opacity = "0";

    setTimeout(() => {
      splash.style.display = "none";
    }, 1000);
  }, 6000);
});

// =====================
// SERVICE WORKER
// =====================
if ("serviceWorker" in navigator) {
 // navigator.serviceWorker.register("sw.js");
}

loadSheet();