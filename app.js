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

  currentProject = project;
  currentBlock = null;

  hideFlatCard();
  backBtn.style.display = "none";
  floorPanel.style.display = "none";

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

  const row = sheetData.find(item => item.flat_id === flatId);

  if (!row) {
    console.warn("Не найдено в таблице:", flatId);
    return;
  }

  document.getElementById("cardContract").innerText =
    row.contract ? "№" + row.contract : "";

  document.getElementById("cardArea").innerText =
    row.area ? row.area + " м²" : "";

  document.getElementById("cardClient").innerText =
    row.client || "";

  flatCard.classList.add("show");
}
