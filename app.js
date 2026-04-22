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

  let clientsData = [];
let isClientsLoaded = false;

fetch("https://opensheet.elk.sh/1bgxMmcENfryGLng9KZwju8zsoQaHBco-aDTmNONlQ2s/clients")
  .then(res => res.json())
  .then(data => {
    console.log("CLIENTS LOADED:", data);
    clientsData = Array.isArray(data) ? data : (data.data || []);
    isClientsLoaded = true;
  })
  .catch(err => console.error("Ошибка загрузки clients:", err));

// =====================
// СОСТОЯНИЕ
// =====================
let currentProject = "kush";
let currentBlock = null;
let currentFloor = 3;
let currentLevel = "main";
let currentClientProject = null;
let currentClientBlock = null;
// =====================
// ЭЛЕМЕНТЫ
// =====================
const plan = document.getElementById("plan");
const backBtn = document.getElementById("backBtn");
const flatCard = document.getElementById("flatCard");
const floorPanel = document.getElementById("floorPanel");
const floorsContainer = document.getElementById("floors");
const clientsScreen = document.getElementById("clientsScreen");
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
    sheet: "obj4",
    floorStart: 1,
    floorEnd: 16,
    blocks: [],
    blockNames: []
  }
};

// =====================
// ВСПОМОГАТЕЛЬНЫЕ
// =====================
const normalize = val => String(val || "").trim().toLowerCase();

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

function selectClientProject(project) {
  currentClientProject = project;
  currentLevel = "clients-blocks";

  renderClientBlocks();
}
window.selectClientProject = selectClientProject;

function renderClientBlocks() {
  clientsScreen.innerHTML = "";

  const blocks = projects[currentClientProject]?.blocks || [];
  const blockNames = projects[currentClientProject]?.blockNames || [];

  const container = document.createElement("div");
  container.style.textAlign = "center";
  container.style.marginTop = "60px";

  blocks.forEach((block, index) => {
    const btn = document.createElement("div");
    btn.className = "menuBtn";

    btn.innerText = blockNames[index] || block.toUpperCase();

    btn.onclick = () => {
      currentClientBlock = block;
      currentLevel = "clients-flats";
      renderClientFlats(); // 🔥 вот сюда идём дальше
    };
    container.appendChild(btn);
  });
  clientsScreen.appendChild(container);
}

function renderClientFlats() {
  clientsScreen.innerHTML = "";
  if (!isClientsLoaded) {
  console.log("clients еще не загрузились");
  return;
}
const container = document.createElement("div");
  container.style.textAlign = "center";
  container.style.marginTop = "60px";

  const blockMap = {
  "А": "b1",
  "Б": "b2",
  "В": "b3",
  "Г": "b4",
  "Д": "b5",
  "Е": "b6"
};

const projectMap = {
  "Куш": "kush",
  "Гафуров": "gafurov",
  "Бустон": "buston"
};

const realBlock = blockMap[currentClientBlock] || currentClientBlock;
const realProject = projectMap[currentClientProject] || currentClientProject;
// 🔍 диагностика
console.log("PROJECT:", realProject);
console.log("BLOCK:", realBlock);
console.log("ВСЕ ДАННЫЕ:", clientsData);
console.log("ПРОЕКТ В СИСТЕМЕ:", currentClientProject);
console.log("БЛОК В СИСТЕМЕ:", currentClientBlock);
console.log("ПЕРВЫЙ flatId:", clientsData[0]?.flatId);
console.log("КЛЮЧИ:", Object.keys(clientsData[0]));
// ✅ фильтр
const rows = clientsData.filter(item => {
  const project = (item["проект"] || "").toLowerCase().trim();
  const flatId = (item.flatId || item.flatID || "").toLowerCase();

  return (
    project === currentClientProject.toLowerCase() &&
    flatId.includes(currentClientBlock.toLowerCase())
  );
});
   console.log("ПЕРВАЯ СТРОКА:", clientsData[0]);
    // 🔍 результат
   console.log("ОТФИЛЬТРОВАНО:", rows);
   rows.forEach(item => {
    const btn = document.createElement("div");
    btn.className = "menuBtn";

    const contract = item["договоры"] || "—";
    const client = item["клиент"] || "—";
    const dollar = item["доллар"] || "0";

    btn.innerHTML = `
   №${contract}<br>
   ${client}<br>
   💵 ${dollar}
   `;

    btn.onclick = () => {
      showClientDetails(item);
    };

    container.appendChild(btn);
  });

  clientsScreen.appendChild(container);
}


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
  ["b1","b2","b3","b4","b5","b6"].forEach(id => {
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

  // 🔥 0. из квартиры → к списку квартир
if (currentLevel === "client-flat") {
  currentLevel = "clients-flats";
  renderClientFlats();
  return;
}
// 🔥 1. из квартир → к подъездам
if (currentLevel === "clients-flats") {
  currentLevel = "clients-blocks";
  renderClientBlocks();
  return;
}
  // 1. из проекта → к списку проектов
  if (currentLevel === "clients-blocks") {
    openClients();
    return;
  }

  // 2. из списка проектов → в главное меню
  if (currentLevel === "clients-projects" || currentLevel === "clients") {
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
  if (!isDataLoaded) return;

  const row = findFlatRow(id);
  if (!row) return;

  cardContract.innerText = row.contract || "";
  cardArea.innerText = row.area ? row.area + " м²" : "";
  cardClient.innerText = row.client || "";

  // 🔥 ОПРЕДЕЛЯЕМ СТАТУС
  const isSold = row.contract || row.client;

if (isSold) {
  cardTitle.innerText = "Продано";
  flatCard.classList.add("sold");
} else {
  cardTitle.innerText = "Свободно";
  flatCard.classList.remove("sold");
}

  flatCard.classList.add("show"); // оставляем твою анимацию
}

// =====================
// КАРТОЧКА 2
// =====================

function showClientDetails(item) {
  clientsScreen.innerHTML = `
    <div style="color:white; text-align:center; margin-top:40px;">

      <h2>№${item.contract}</h2>
      <p>${item.client}</p>
      <p>📞 ${item.phone}</p>

      <p>Проект: ${item.project}</p>
      <p>Блок: ${item.block}</p>
      <p>Этаж: ${item.floor}</p>

      <h3>💰 Долг: ${item.debt}</h3>

    </div>
  `;
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

function openClients() {
  currentLevel = "clients";

  // скрываем старое
  document.getElementById("mainMenu1").style.display = "none";
  document.getElementById("mainMenu").style.display = "none";
  plan.style.display = "none";
  floorPanel.style.display = "none";

  // показываем новое
  clientsScreen.style.display = "block";

  clientsScreen.innerHTML = `
  <div style="text-align:center; margin-top:60px;">
    <div class="menuBtn" onclick="selectClientProject('kush')">Куш</div>
    <div class="menuBtn" onclick="selectClientProject('gafurov')">Гафуров</div>
    <div class="menuBtn" onclick="selectClientProject('buston')">Бустон</div>
  </div>
`;

  backBtn.style.display = "block";
}

function showClientFlatInfo(flat) {
  clientsScreen.innerHTML = `
    <div style="color:white; text-align:center; margin-top:80px;">
      Проект: ${currentClientProject.toUpperCase()}<br>
      Подъезд: ${currentClientBlock.toUpperCase()}<br>
      Квартира: ${flat}
    </div>
  `;
}