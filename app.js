let currentBlock = null;
let currentFloor = 3;
let sheetData = [];

let isDataLoaded = false; // 🔥 контроль загрузки

console.log("APP STARTED");

const plan = document.getElementById("plan");
const floorsContainer = document.getElementById("floors");

const floorPanel = document.getElementById("floorPanel");
const backBtn = document.getElementById("backBtn");

const blocks = ["b1", "b2", "b3", "b4", "b5", "b6"];

// =====================
// GOOGLE SHEETS
// =====================
fetch("https://opensheet.elk.sh/1bgxMmcENfryGLng9KZwju8zsoQaHBco-aDTmNONlQ2s/plan")
  .then(res => res.json())
  .then(data => {
    console.log("DATA LOADED:", data);
    sheetData = Array.isArray(data) ? data : (data.data || []);
    isDataLoaded = true; // ✅ данные готовы
  })
  .catch(err => {
    console.error("Ошибка загрузки данных:", err);
  });

// =====================
// ЗАГРУЗКА SVG
// =====================
plan.onload = function () {
  const svg = plan.contentDocument;
  if (!svg) return;

  console.log("SVG LOADED:", plan.data);

  if (plan.data.includes("blocks")) {
    initBlocks(svg);
    return;
  }

  if (currentBlock) {
    initFloors();
    loadFlats(currentBlock);
  }
};

// =====================
// БЛОКИ
// =====================
function initBlocks(svg) {
  blocks.forEach(blockId => {
    const block = svg.getElementById(blockId);
    if (!block) return;

    block.style.cursor = "pointer";

    block.onclick = function () {
      currentBlock = blockId;
      currentFloor = 3;
history.pushState({ screen: "block" }, "");

      plan.data = blockId + ".svg";

      floorPanel.style.display = "block";
      backBtn.style.display = "block";

      initFloors();

      const card = document.getElementById("flatCard");
      if (card) card.classList.remove("show");
    };
  });
}

// =====================
// КВАРТИРЫ
// =====================
function loadFlats(blockId) {
  const svgDoc = plan.contentDocument;
  if (!svgDoc) return;

  const flats = ["flat1", "flat2", "flat3", "flat4", "flat5"];

  flats.forEach(flatId => {
    const flat = svgDoc.getElementById(flatId);
    if (!flat) return;

    flat.style.cursor = "pointer";

    // 👉 цвет при загрузке (если данные уже есть)
    if (isDataLoaded) {
      const fullId = blockId + "-" + currentFloor + "-" + flatId;
      const flatData = sheetData.find(item => item.flat_id === fullId);

      if (flatData && flatData.color) {
        flat.style.fill = flatData.color;
      }
    }

    flat.onclick = function () {

      // 🔒 защита от быстрых кликов
      if (!isDataLoaded) {
        console.log("Данные ещё не загрузились");
        return;
      }

      const fullId = blockId + "-" + currentFloor + "-" + flatId;
      const flatData = sheetData.find(item => item.flat_id === fullId);

      flats.forEach(id => {
        const f = svgDoc.getElementById(id);
        if (f) {
          f.style.stroke = "";
          f.style.strokeWidth = "";
        }
      });

      flat.style.stroke = "red";
      flat.style.strokeWidth = "3";

      if (flatData && flatData.color) {
        flat.style.fill = flatData.color;
      }

      const card = document.getElementById("flatCard");
      if (card) card.classList.add("show");
      history.pushState({ screen: "flat" }, "");

      document.getElementById("cardFlat").innerText = flatId;

      if (flatData) {
        document.getElementById("cardArea").innerText = (flatData.area || "-") + " м²";
        document.getElementById("cardStatus").innerText = flatData.status || "-";

        let client = flatData.client || "";
        if (!client || client === "." || client.trim() === "") {
          client = "свободно";
        }

        document.getElementById("cardClient").innerText = client;
      } else {
        document.getElementById("cardArea").innerText = "-";
        document.getElementById("cardStatus").innerText = "-";
        document.getElementById("cardClient").innerText = "нет данных";
      }
    };
  });
}

// =====================
// ЭТАЖИ
// =====================
function initFloors() {
  floorsContainer.innerHTML = "";

  for (let i = 3; i <= 18; i++) {
    const btn = document.createElement("button");
    btn.classList.add("floor-btn");

    btn.innerText = i + " этаж";
    btn.style.margin = "4px";

    if (i === currentFloor) {
      btn.classList.add("active");
    }

    btn.onclick = function () {
      currentFloor = i;

      const card = document.getElementById("flatCard");
      if (card) card.classList.remove("show");

      initFloors();
      plan.data = currentBlock + ".svg?t=" + Date.now();
    };

    floorsContainer.appendChild(btn);
  }
}

// =====================
// НАЗАД
// =====================
backBtn.onclick = function () {
  currentBlock = null;
  plan.data = "blocks.svg";

  floorPanel.style.display = "none";
  backBtn.style.display = "none";

  const card = document.getElementById("flatCard");
  if (card) card.classList.remove("show");

  floorsContainer.innerHTML = "";
};
// =====================
// КНОПКА НАЗАД ТЕЛЕФОНА
// =====================
window.addEventListener("popstate", () => {

  const card = document.getElementById("flatCard");

  // если открыта карточка
  if (card && card.classList.contains("show")) {
    card.classList.remove("show");
    return;
  }

  // если внутри блока
  if (currentBlock !== null) {
    currentBlock = null;
    plan.data = "blocks.svg";

    floorPanel.style.display = "none";
    backBtn.style.display = "none";
    floorsContainer.innerHTML = "";

    return;
  }
    // =====================
// СВАЙП НАЗАД (оба направления)
// =====================

let touchStartX = 0;
let touchEndX = 0;

window.addEventListener("touchstart", e => {
  touchStartX = e.changedTouches[0].screenX;
});

window.addEventListener("touchend", e => {
  touchEndX = e.changedTouches[0].screenX;

  const deltaRight = touchEndX - touchStartX; // слева → направо
  const deltaLeft = touchStartX - touchEndX;  // справа → налево

  // 👉 свайп слева направо
  if (touchStartX < 50 && deltaRight > 80) {
    history.back();
  }

  // 👉 свайп справа налево
  if (touchStartX > window.innerWidth - 50 && deltaLeft > 80) {
    history.back();
  }
});
