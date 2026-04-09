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
  kush: { svg: "blocks.svg" },
  buston: { svg: "bustonblocks.svg" },
  gafurov: { svg: "gafurovblocks.svg" },
  obj4: { svg: null }
};

// =====================
// ВЫБОР ПРОЕКТА
// =====================
function selectProject(project) {

if (!projects[project]) {
  console.error("Нет проекта:", project);
    return;
  }

  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("plan").style.display = "block";
  document.getElementById("floorPanel").style.display = "block";
  document.getElementById("backBtn").style.display = "block"; 
 
  

  currentProject = project;
  currentBlock = null;

  hideFlatCard();


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

  for (let i = 3; i <= 18; i++) {
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

      let fileName = currentBlock + ".svg";

      if (currentProject === "buston") {
        fileName = "buston" + currentBlock + ".svg";
      } else if (currentProject === "gafurov") {
        fileName = "gafurov" + currentBlock + ".svg";
      }

      hideFlatCard();
      loadSVG(fileName);
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

    const defs = svg.querySelector("defs") || svg.createElementNS("http://www.w3.org/2000/svg", "defs");

    if (!svg.querySelector("#soldPattern")) {
        const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
       
        pattern.setAttribute("id", "soldPattern");
        pattern.setAttribute("patternUnits", "objectBoundingBox");
        pattern.setAttribute("patternTransform", "rotate(45)");

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

line.setAttribute("x1", "0");
line.setAttribute("y1", "0");
line.setAttribute("x2", "0");
line.setAttribute("y2", "5");

// 👇 ВОТ ГЛАВНОЕ
line.style.stroke = "#ffffff";
line.style.strokeWidth = "5,5";
line.style.opacity = "0.5";
       pattern.setAttribute("width", "0.1");
       pattern.setAttribute("height", "0.1");
 
        pattern.appendChild(line);
        defs.appendChild(pattern);
        svg.documentElement.appendChild(defs);
    }
  console.log("SVG загружен:", plan.data);

  // =====================
  // ЕСЛИ ВНУТРИ БЛОКА → КВАРТИРЫ
  // =====================
  if (currentBlock) {
  const flats = [
    "flat1","flat2","flat3","flat4","flat5",
    "flat6","flat7","flat8","flat9","flat10"
  ];

  flats.forEach(id => {
    const el = svg.getElementById(id);
    if (!el) return;

    el.style.cursor = "pointer";

    const row = sheetData.find(item =>
      item.flat &&
      item.flat.toString().trim().toLowerCase() === id.toLowerCase() &&
      Number(item.floor) === Number(currentFloor)
    );

    if (row && (row.contract || row.client)) {
      console.log("ПРОДАНО:", id);

      const oldBg = svg.getElementById(id + "_sold_bg");
      const oldPattern = svg.getElementById(id + "_sold_pattern");

      if (oldBg) oldBg.remove();
      if (oldPattern) oldPattern.remove();

      el.style.fill = "none";
      el.setAttribute("fill", "none");

      const bg = el.cloneNode(true);
      bg.removeAttribute("style");
      bg.setAttribute("fill", "rgba(255,255,255,0.25)");
      bg.style.pointerEvents = "none";
      bg.id = id + "_sold_bg";

      const pattern = el.cloneNode(true);
      pattern.removeAttribute("style");
      pattern.removeAttribute("stroke");
      pattern.setAttribute("fill", "url(#soldPattern)");
      pattern.style.pointerEvents = "none";
      pattern.style.opacity = "0.8";
      pattern.id = id + "_sold_pattern";

      el.parentNode.appendChild(bg);
      el.parentNode.appendChild(pattern);
    }

    // 👇 ВАЖНО: onclick должен быть СНАРУЖИ if
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
  const blocks = ["b1","b2","b3","b4","b5","b6"];

  blocks.forEach(id => {
    const el = svg.getElementById(id);
    if (!el) return;

    el.style.cursor = "pointer";

    el.onclick = () => {
      console.log("Блок:", id);

      currentBlock = id;
      hideFlatCard();

      // 🔥 ВОТ ЗДЕСЬ ВКЛЮЧАЕМ ЭТАЖИ
      showFloors();

      let fileName = id + ".svg";

      if (currentProject === "buston") {
        fileName = "buston" + id + ".svg";
      } else if (currentProject === "gafurov") {
        fileName = "gafurov" + id + ".svg";
      }

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

  const row = sheetData.find(item =>
  item.flat &&
  item.flat.toString().trim().toLowerCase() === flatId.toLowerCase() &&
  Number(item.floor) === Number(currentFloor)
);

  if (!row) {
    console.warn("Не найдено в таблице:", flatId);
    return;
  }

  document.getElementById("cardContract").innerText =
  row.contract || "";

  document.getElementById("cardArea").innerText =
    row.area ? row.area + " м²" : "";

  document.getElementById("cardClient").innerText =
    row.client || "";

  flatCard.classList.add("show");
}
function hideFlatCard() {
  if (!flatCard) return;
  flatCard.classList.remove("show");
}

window.hideFlatCard = hideFlatCard;

window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash");

    splash.style.transition = "opacity 1s";
    splash.style.opacity = "0";

    setTimeout(() => {
      splash.style.display = "none";
    }, 1000);

  }, 6000);
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
