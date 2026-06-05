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
  .catch(err => console.error("Ошибка загрузки данных:", err));

// =====================
// СОСТОЯНИЕ
// =====================
let currentProject = "kush";
let currentBlock = null;
let currentFloor = 3;

let currentLevel = "main";

// =====================
// ЭЛЕМЕНТЫ
// =====================
const plan = document.getElementById("plan");
const backBtn = document.getElementById("backBtn");
const flatCard = document.getElementById("flatCard");
const floorPanel = document.getElementById("floorPanel");
const floorsContainer = document.getElementById("floors");
const clientsScreen = document.getElementById("clientsScreen");

const monitoringScreen = document.getElementById("monitoringScreen");
const mainMenu1 = document.getElementById("mainMenu1");
const mainMenu = document.getElementById("mainMenu");
// =====================
// ПРОЕКТЫ  (ИМЯ БЛОКОВ )
// =====================

const projects = {
  kush: {
    svg: "blocks.svg",
    sheet: "blocks",
    floorStart: 3,
    floorEnd: 18,
    blocks: ["b1","b2","b3","b4","b5","b6"],
    blockNames: ["А","Б","В","Г","Д","Е"] // 🔥 русские буквы
  },
    buston: {
    svg: "bustonblocks.svg",
    sheet: "bustonblocks",
    floorStart: 1,
    floorEnd: 16,
    blocks: ["b1","b2"],
    blockNames: ["А","Б"]
  },
    gafurov: {
    svg: "gafurovblocks.svg",
    sheet: "gafurovblocks",
    floorStart: 1,
    floorEnd: 14,
    blocks: ["b1","b2"],
    blockNames: ["А","Б"]
  },
    obj4: {
  svg: null,
  sheet: "14-15blocks",
  floorStart: 1,
  floorEnd: 18,

  blocks: ["b1","b2"],

  blockNames: ["А","Б"]
}, // ← ВОТ ЭТА ЗАПЯТАЯ

sholk: {
  svg: null,
  sheet: "sholk",

  floorStart: 1,
  floorEnd: 16,

  blocks: ["b1"],
  blockNames: ["3"]
},

nabiev: {
  svg: null,
  sheet: "nabiev",

  floorStart: 1,
  floorEnd: 18,

  blocks: ["b1"],
  blockNames: ["1"]
},

mikro8: {
  svg: "8blocks.svg",
  sheet: "8mkr",

  floorStart: 2,
  floorEnd: 12,

  blocks: ["8b1","8b2","8b3","8v"],

  blockNames: ["Б-1","Б-2","Б-3","В"]
},

mikro12: {
  title: "12-й микрорайон",

  sheet: "12",

  blocks: ["b1", "b2"],

  blockNames: ["А", "Б"]
},

mikro32: {
  title: "32/2 микрорайон",

  sheet: "32/2",

  blocks: ["b1"],

  blockNames: ["2"]
},

gaf1: {
  title: "Гафуров 1",

  sheet: "gaf",

  blocks: ["b1"],

  blockNames: ["1"]
},

mikro321: {
  title: "32/1 микрорайон",
  sheet: "32/1",
  blocks: ["b1"],
  blockNames: ["1"]
},

mikro20: {
  name: "20 микрорайон",
  sheet: "20",
  blocks: ["b1"],
  blockNames: ["1 блок"]
},

buston1: {
  svg: "bustonb1.svg",
  sheet: "buston1",
  floorStart: 1,
  floorEnd: 10,
  blocks: ["b1","b2"],
  blockNames: ["А","Б"]
},
};

// =====================
// ПРОЕКТЫ
// =====================
function selectProject(project) {
  if (!projects[project]) return;

  currentLevel = "blocks";
  currentProject = project;
  currentBlock = null;
  currentFloor = projects[project].floorStart;

  hideFlatCard();

  mainMenu.style.display = "none";
  plan.style.display = "block";
  floorPanel.style.display = "none";
  backBtn.style.display = "block";

  if (!projects[project].svg) return;

  loadSVG(projects[project].svg);
}
window.selectProject = selectProject;

function openProjects() {
  currentLevel = "projects";

  mainMenu1.style.display = "none";
  mainMenu.style.display = "flex";

  plan.style.display = "none";
  floorPanel.style.display = "none";

  backBtn.style.display = "block";
}
window.openProjects = openProjects;

// =====================
// SVG
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

  const start = projects[currentProject]?.floorStart ?? 1;
  const end = projects[currentProject]?.floorEnd ?? 16;

  for (let i = start; i <= end; i++) {
    const btn = document.createElement("button");
    btn.className = "floor-btn";
    if (i === currentFloor) btn.classList.add("active");

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
// SVG ЗАГРУЖЕН
// =====================
plan.onload = function () {
  const svg = plan.contentDocument;
  if (!svg) return;
  // =====================
// СОЗДАЕМ ШТРИХОВКУ
// =====================
if (!svg.querySelector("#soldPattern")) {

  const defs = svg.querySelector("defs") ||
    document.createElementNS("http://www.w3.org/2000/svg", "defs");

  const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");

  pattern.setAttribute("id", "soldPattern");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  pattern.setAttribute("width", "6");
  pattern.setAttribute("height", "6");
  pattern.setAttribute("patternTransform", "rotate(45)");

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

  line.setAttribute("x1", "0");
  line.setAttribute("y1", "0");
  line.setAttribute("x2", "0");
  line.setAttribute("y2", "6");

  line.setAttribute("stroke", "#ffffff");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("opacity", "0.5");

  pattern.appendChild(line);
  defs.appendChild(pattern);

  svg.documentElement.appendChild(defs);
}

  console.log("SVG загружен:", plan.data);

  // ===== КВАРТИРЫ =====
  if (currentBlock) {
    const flats = Array.from(svg.querySelectorAll('[id^="flat"]'))
      .filter(el => /^flat\d+$/i.test(el.id));

    flats.forEach(el => {
  const id = el.id;
  el.style.cursor = "pointer";

  const row = findFlatRow(id);

  // 🔥 ВАЖНО — базовый клик для всех
  el.onclick = () => showFlatCard(id);

  if (row && (row.contract || row.client)) {

  const oldBg = svg.getElementById(id + "_sold_bg");
  const oldPattern = svg.getElementById(id + "_sold_pattern");
  const oldHit = svg.getElementById(id + "_hit");

  if (oldBg) oldBg.remove();
  if (oldPattern) oldPattern.remove();
  if (oldHit) oldHit.remove();

  el.style.fill = "none";
  el.setAttribute("fill", "none");

  // 🔹 Белый фон
  const bg = el.cloneNode(true);
  bg.removeAttribute("style");
  bg.setAttribute("fill", "rgba(255,255,255,0.4)");
  bg.style.pointerEvents = "none";
  bg.id = id + "_sold_bg";

  // 🔹 ШТРИХОВКА
  const patternLayer = el.cloneNode(true);
  patternLayer.removeAttribute("style");
  patternLayer.setAttribute("fill", "url(#soldPattern)");
  patternLayer.style.pointerEvents = "none";
  patternLayer.style.opacity = "0.8";
  patternLayer.setAttribute("stroke", "#ffffff");
  patternLayer.setAttribute("stroke-width", "1.5");
  patternLayer.id = id + "_sold_pattern";

  // 🔹 КЛИК
  const hit = el.cloneNode(true);
  hit.removeAttribute("style");
  hit.setAttribute("fill", "rgba(0,0,0,0.001)");
  hit.style.cursor = "pointer";
  hit.style.pointerEvents = "all";
  hit.id = id + "_hit";

  hit.onclick = () => showFlatCard(id);

  el.parentNode.appendChild(bg);
  el.parentNode.appendChild(patternLayer);
  el.parentNode.appendChild(hit);
}
    });

    return;
  }

  // ===== БЛОКИ =====
  (projects[currentProject].blocks || []).forEach(id => {
    const el = svg.getElementById(id);
    if (!el) return;

    el.style.cursor = "pointer";

    el.onclick = () => {
      currentBlock = id;
      currentLevel = "flats";

      hideFlatCard();
      showFloors();

      loadSVG(getBlockSvgFile(currentProject, id));
    };
  });
};

// =====================
// НАЗАД
// =====================
backBtn.onclick = () => {

  console.log("НАЗАД:", currentLevel);
// мониторинг → главное меню
if (currentLevel === "sales-monitoring" || currentLevel === "debt-monitoring") {
  openMonitoring();
  return;
}
// из продаж → в мониторинг
if (
currentLevel === "sales-monitoring" ||
currentLevel === "debt-monitoring" ||
currentLevel === "build-monitoring" ||
currentLevel === "managers-monitoring" ||
currentLevel === "finance-monitoring" ||
currentLevel === "problems-monitoring"
)
{
openMonitoring();
return;
}

// из мониторинга → в главное меню
if (currentLevel === "monitoring") {

  monitoringScreen.style.display = "none";

  mainMenu1.style.display = "flex";

  backBtn.style.display = "none";

  currentLevel = "main";

  return;
}
  
// =====================
// НАЗАД: ПОГАШЕНИЕ
// =====================

// из карточки клиента → к списку должников
if (currentLevel === "client-flat") {
  currentLevel = "clients-flats";
  renderClientFlats();
  return;
}

// из списка должников → к блокам / объектам
if (currentLevel === "clients-flats") {

  currentLevel = "clients-blocks";
  renderClientBlocks();
  return;
}

// из блоков → к списку объектов
if (currentLevel === "clients-blocks") {
  openClients();
  return;
}

// из списка объектов → главное меню
if (currentLevel === "clients") {
  clientsScreen.style.display = "none";
  mainMenu1.style.display = "flex";
  backBtn.style.display = "none";
  currentLevel = "main";
  return;
}

  // 3. дальше твоя старая логика (для SVG)
  if (flatCard.classList.contains("show")) {
    hideFlatCard();
    return;
  }

  if (currentLevel === "flats") {
    currentLevel = "blocks";
    currentBlock = null;
    floorPanel.style.display = "none";
    loadSVG(projects[currentProject].svg);
    return;
  }

  if (currentLevel === "blocks") {
    currentLevel = "projects";
    plan.style.display = "none";
    mainMenu.style.display = "flex";
    return;
  }

  if (currentLevel === "projects") {
    currentLevel = "main";
    mainMenu.style.display = "none";
    mainMenu1.style.display = "flex";
    backBtn.style.display = "none";
    return;
  }

};

// =====================
// КАРТОЧКА
// =====================
function showFlatCard(id) {
  const row = findFlatRow(id);

  cardContract.innerText = row?.contract || "";
  cardArea.innerText = row?.area ? row.area + " м²" : "";
  cardClient.innerText = row?.client || "";

  const isSold = row && (row.contract || row.client);

  if (isSold) {
    cardTitle.innerText = "Продано";
    flatCard.classList.add("sold");
  } else {
    cardTitle.innerText = "Свободно";
    flatCard.classList.remove("sold");
  }

  flatCard.classList.add("show");
}



function hideFlatCard() {
  flatCard.classList.remove("show");
  flatCard.classList.remove("sold"); // 🔥 обязательно
}

window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  if (!splash) return;

  setTimeout(() => {
    splash.style.opacity = "0";
    splash.style.transition = "opacity 1s";

    setTimeout(() => {
      splash.style.display = "none";
    }, 1000);

  }, 2000); // 2 секунды
});




