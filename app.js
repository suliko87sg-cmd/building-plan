let currentBlock = null;
let currentFloor = 3;
let sheetData = [];

let isDataLoaded = false;

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
    isDataLoaded = true;
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

  // pattern для штриховки проданных квартир
  let defs = svgDoc.querySelector("defs");

  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svgDoc.documentElement.appendChild(defs);
  }

  if (!svgDoc.getElementById("soldPattern")) {
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", "soldPattern");
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", "8");
    pattern.setAttribute("height", "8");

    const line1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line1.setAttribute("d", "M0,8 L8,0");
    line1.setAttribute("stroke", "white");
    line1.setAttribute("stroke-width", "1");

    const line2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line2.setAttribute("d", "M-2,2 L2,-2 M6,10 L10,6");
    line2.setAttribute("stroke", "white");
    line2.setAttribute("stroke-width", "1");

    pattern.appendChild(line1);
    pattern.appendChild(line2);
    defs.appendChild(pattern);
  }

  const flats = ["flat1", "flat2", "flat3", "flat4", "flat5"];

  flats.forEach(flatId => {
    const flat = svgDoc.getElementById(flatId);
    if (!flat) return;

    flat.style.cursor = "pointer";

    const fullId = blockId + "-" + currentFloor + "-" + flatId;
    const flatData = sheetData.find(item => item.flat_id === fullId);

    // сначала чистим старое состояние
    flat.style.opacity = "1";
    flat.style.stroke = "";
    flat.style.strokeWidth = "";

    // базовый цвет
    if (flatData && flatData.color) {
      flat.style.fill = flatData.color;
      flat.setAttribute("fill", flatData.color);
    }

    // если есть клиент → квартира занята → штрихуем
    if (flatData && flatData.client && flatData.client.trim() !== "") {
      flat.setAttribute("fill", "url(#soldPattern)");
      flat.style.opacity = "0.85";
    }

    flat.onclick = function () {
      if (!isDataLoaded) {
        console.log("Данные ещё не загрузились");
        return;
      }

      const fullId = blockId + "-" + currentFloor + "-" + flatId;
      const flatData = sheetData.find(item => item.flat_id === fullId);

      flats.forEach(id => {
        const f = svgDoc.getElementById(id);
        if (!f) return;

        f.style.stroke = "";
        f.style.strokeWidth = "";

        const rowId = blockId + "-" + currentFloor + "-" + id;
        const rowData = sheetData.find(item => item.flat_id === rowId);

        if (rowData && rowData.client && rowData.client.trim() !== "") {
          f.setAttribute("fill", "url(#soldPattern)");
          f.style.opacity = "0.85";
        } else if (rowData && rowData.color) {
          f.setAttribute("fill", rowData.color);
          f.style.opacity = "1";
        }
      });

      flat.style.stroke = "red";
      flat.style.strokeWidth = "3";

      const card = document.getElementById("flatCard");
      if (card) card.classList.add("show");

      history.pushState({ screen: "flat" }, "");

      let contract = "";
      let area = "-";
      let client = "—";

      if (flatData) {
        if (flatData.contract && flatData.contract.trim() !== "") {
          contract = flatData.contract.trim();
        }

        if (flatData.area && flatData.area.toString().trim() !== "") {
          area = flatData.area + " м²";
        }

        if (flatData.client && flatData.client.trim() !== "") {
          client = flatData.client;
        }
      }

      document.getElementById("cardContract").innerText = contract;
      document.getElementById("cardArea").innerText = area;
      document.getElementById("cardClient").innerText = client;
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

  if (card && card.classList.contains("show")) {
    card.classList.remove("show");
    return;
  }

  if (currentBlock !== null) {
    currentBlock = null;
    plan.data = "blocks.svg";

    floorPanel.style.display = "none";
    backBtn.style.display = "none";
    floorsContainer.innerHTML = "";
  }
});