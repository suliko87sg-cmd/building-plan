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

// 🔥 ВОТ ЭТО ДОБАВЛЯЕМ
let currentClientRows = [];
let currentClientIndex = 0;
let selectedManager = "all";
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

  if (!isClientsLoaded) return;

  const container = document.createElement("div");
  container.style.textAlign = "center";
  container.style.marginTop = "60px";

  const projectMap = {
    "Куш": "kush",
    "Гафуров": "gafurov",
    "Бустон": "buston"
  };

  const realProject = projectMap[currentClientProject] || currentClientProject;

  const prefix = (projects[realProject].sheet + "-" + currentClientBlock).toLowerCase();

  // 🔽 фильтр по ID
  const rowsById = clientsData.filter(item => {
    const flatId = (item.flatId || item.flatID || "")
      .toString()
      .toLowerCase()
      .replace(/\s/g, "");

    return flatId.startsWith(prefix);
  });

  // 🔽 только должники
  const rows = rowsById.filter(item => {
    const d = (item["доллар"] || "").toString().trim();
    return d.startsWith("-");
  });

  // =======================
  // 📊 считаем менеджеров
  // =======================
  const managerCounts = {};

  rows.forEach(item => {
    const m = (item["менеджер"] || "").trim();
    if (!m) return;
    managerCounts[m] = (managerCounts[m] || 0) + 1;
  });

  const managers = Object.keys(managerCounts);

// =======================
// 🎛️ UI фильтра (КНОПКИ)
// =======================
const filterBox = document.createElement("div");
filterBox.className = "managerFilter";

// кнопка ВСЕ
const allBtn = document.createElement("div");
allBtn.className = "filterItem" + (selectedManager === "all" ? " active" : "");
allBtn.textContent = `Все (${rows.length})`;

allBtn.onclick = () => {
  selectedManager = "all";
  renderClientFlats();
};

filterBox.appendChild(allBtn);

// кнопки менеджеров
managers.forEach(name => {
  const btn = document.createElement("div");

  btn.className = "filterItem" + (selectedManager === name ? " active" : "");
  btn.textContent = `👤 ${name} (${managerCounts[name]})`;
allBtn.textContent = `📋 Все (${rows.length})`;
  btn.onclick = () => {
    selectedManager = name;
    renderClientFlats();
  };

  filterBox.appendChild(btn);
});

// вставляем ПЕРЕД списком
container.appendChild(filterBox);
// фильтр данных
const filteredRows = rows.filter(item => {
  const m = (item["менеджер"] || "").trim();
  if (selectedManager === "all") return true;
  return m === selectedManager;
});

currentClientRows = filteredRows;

// вывод
filteredRows.forEach(item => {
  const btn = document.createElement("div");
  btn.className = "clientBtn";

  const contract = item["договоры"] || "—";
  const client = item["клиент"] || "—";
  const dollar = item["доллар"] || "0";

  btn.innerHTML = `
    <div class="rowTop">${contract}</div>
    <div class="rowBottom">
      <span class="client">${client}</span>
      <span class="money">💵 ${dollar}</span>
    </div>
  `;

  btn.onclick = () => {
    currentLevel = "client-flat";
    currentClientIndex = currentClientRows.indexOf(item);
    showClientDetails(item);
  };

  container.appendChild(btn);
});

  // =====================
  // КАРТОЧКА 2 
  // =====================

clientsScreen.appendChild(container); // ← добавь это

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
function goBack() {
  if (typeof backBtn.onclick === "function") {
    backBtn.onclick();
  }
}
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
function nextClient() {
  if (!currentClientRows.length) return;

  currentClientIndex++;

  if (currentClientIndex >= currentClientRows.length) {
    currentClientIndex = 0;
  }

  showClientDetails(currentClientRows[currentClientIndex]);
}
function showClientDetails(item) {

   const phone = item["телефон"] || "-";
  const cleanPhone = phone.replace(/\D/g, "");

  const screen = document.getElementById("clientsScreen");

  // ✅ 1. старт клиента
const start = item["старт"];
console.log("СТАРТ:", start);

const startDate = parseDate(start);

const normalized = {};
Object.keys(item).forEach(k => {
  normalized[k.trim()] = item[k];
});

// 1. Берём колонки оплат из таблицы: 01/24, 02/24, 03/24...
const paymentKeys = Object.keys(normalized)
  .filter(k => /^\d{2}\/\d{2}$/.test(k))
  .sort((a, b) => {
    const [m1, y1] = a.split("/").map(Number);
    const [m2, y2] = b.split("/").map(Number);
    return y1 === y2 ? m1 - m2 : y1 - y2;
  });

// 2. Строим реальные месяцы от старта клиента
const realMonths = startDate ? generateMonths(startDate, paymentKeys.length) : paymentKeys;

// ✅ 2. собираем квадраты
let grid = "";

// 🔥 ВОТ СЮДА




const today = new Date();
today.setDate(1);
today.setHours(0,0,0,0);
  let futureCount = 0;
const MAX_FUTURE = 12;
realMonths.forEach((m, index) => {

  const [month, year] = m.split("/");
const cellDate = new Date(2000 + Number(year), Number(month) - 1, 1);

// ограничиваем будущее
if (cellDate > today) {
  futureCount++;
  if (futureCount > MAX_FUTURE) return;
}

const isCurrentMonth =
  cellDate.getFullYear() === today.getFullYear() &&
  cellDate.getMonth() === today.getMonth();
  const key = paymentKeys[index];
const value = key ? normalized[key] : "";

  const cleanValue = Number(String(value).replace(/\s/g, "")) || 0;

  let cls = "empty";

  if (cleanValue > 0) {
    cls = "paid"; // 🟢 есть деньги
  } else if (cellDate < today) {
    cls = "late"; // 🟡 просрочка
  } else {
    cls = "empty"; // ⚪ будущее
    let isCurrentMonth =
  cellDate.getFullYear() === today.getFullYear() &&
  cellDate.getMonth() === today.getMonth();
  }

  grid += `
  <div class="payCell ${cls} ${isCurrentMonth ? "currentMonth" : ""}">
    ${value || ""}
  </div>
`;
});
const blockReverseMap = {
  "b1": "А",
  "b2": "Б",
  "b3": "В",
  "b4": "Г",
  "b5": "Д",
  "b6": "Е"
};
const projectNameMap = {
  "buston": "Бустон",
  "kush": "Куш",
  "gafurov": "Гафуров"
};
const projectKey = (item["проект"] || "").toLowerCase().trim();
const niceProject = projectNameMap[projectKey] || projectKey;
const flatId = (item.flatId || item.flatID || "").toLowerCase();
const realBlock = flatId.split("-")[1]; // ← вот магия
const niceBlock = blockReverseMap[realBlock] || realBlock;

const displayProject = `${niceProject} ${niceBlock}`;
  // ✅ 3. выводим всё
  screen.innerHTML = `
    <div style="padding:20px; color:white;">
    
    <div class="managerTop">👤 ${item["менеджер"] || "-"}</div>

      <h3 style="opacity:0.7; margin-bottom:5px;">
  ${item["договоры"] || "—"}
</h3>

<h2 style="margin-top:0;">
  ${item["клиент"]}
</h2>

  <div class="phoneRow">
  <span class="phoneText">📞 ${item["телефон"] || "-"}</span>

  <a href="tel:${(item["телефон"] || "").replace(/\D/g, "")}" 
     <a href="tel:${(item["телефон"] || "").replace(/\D/g, "")}" 
   class="callMiniBtn">

  <span class="callIcon">📞</span>
  <span>Позвонить</span>

</a>

  <div class="phoneActions">
    <a href="https://wa.me/${(item["телефон"] || "").replace(/\D/g, "")}" 
       target="_blank"
       class="waBtn">
       <img src="whatsapp.svg">
    </a>
  </div>
</div>

      <p>🏢 ${item["проект"] || "-"}</p>
      <p>💰 Фикс: ${item["фикс/сумм"]}</p>

      <hr>

      <p>✅ Оплачено: ${item["оплачено"]}</p>
      <p>📉 Остаток: ${item["долг"]} сомони</p>

      <h3>💵 Долг: ${item["доллар"]} $</h3>

      <div class="paymentGrid">
        ${grid}
      </div>
<div class="navBtns">
  <button onclick="prevClient()">⬆ Предыдущий</button>
  <button onclick="nextClient()">⬇ Следующий</button>
</div>
    </div>
  `;
}

function parseDate(dateStr) {
  if (!dateStr) return null;

  const parts = dateStr.split(/[.,]/);
  return new Date(parts[2], parts[1] - 1, parts[0]);
}
function generateMonths(startDate, count = 24) {
  const months = [];

  let month = startDate.getMonth();
  let year = startDate.getFullYear();

  for (let i = 0; i < count; i++) {
    const m = String(month + 1).padStart(2, "0");
    const y = String(year).slice(2);

    months.push(`${m}/${y}`);

    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return months;
}
function prevClient() {
  if (!currentClientRows.length) return;

  currentClientIndex--;

  if (currentClientIndex < 0) {
    currentClientIndex = currentClientRows.length - 1;
  }

  showClientDetails(currentClientRows[currentClientIndex]);
}
let startY = 0;
let startX = 0;

// 👉 фиксируем начало
document.addEventListener("touchstart", (e) => {
  if (currentLevel !== "client-flat") return;

  startY = e.touches[0].clientY;
  startX = e.touches[0].clientX;
});

// 👉 анализируем жест
document.addEventListener("touchend", (e) => {
  if (currentLevel !== "client-flat") return;

  const endY = e.changedTouches[0].clientY;
  const endX = e.changedTouches[0].clientX;

  const deltaX = startX - endX;
  const deltaY = startY - endY;

  // 👉 определяем направление
  if (Math.abs(deltaX) > Math.abs(deltaY)) {

    // горизонтальный свайп
    if (deltaX > 70) {
      goBack();
    }

  } else {

    // вертикальный свайп
    if (deltaY > 50) {
      nextClient();
    }

    if (deltaY < -50) {
      prevClient();
    }

  }
});
// ===== SWIPE BACK (iPhone style) =====

const EDGE_SIZE = 30;   // зона от края (px)
const MIN_SWIPE = 70;   // минимальная длина свайпа

document.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];

  startX = touch.clientX;
  startY = touch.clientY;

  const screenWidth = window.innerWidth;

  // старт только с краёв
  if (startX < EDGE_SIZE || startX > screenWidth - EDGE_SIZE) {
    isEdgeSwipe = true;
  } else {
    isEdgeSwipe = false;
  }
});

document.addEventListener("touchend", (e) => {
  if (!isEdgeSwipe) return;

  const touch = e.changedTouches[0];
  const endX = touch.clientX;
  const endY = touch.clientY;

  const deltaX = endX - startX;
  const deltaY = Math.abs(endY - startY);

  // защита от вертикальных свайпов
  if (deltaY > 50) return;

  const screenWidth = window.innerWidth;

  // 👉 свайп СЛЕВА → ВПРАВО
  if (startX < EDGE_SIZE && deltaX > MIN_SWIPE) {
    goBack();
  }

  // 👉 свайп СПРАВА → ВЛЕВО
  if (startX > screenWidth - EDGE_SIZE && deltaX < -MIN_SWIPE) {
    goBack();
  }
});