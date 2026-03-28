let currentBlock = null;
let currentFloor = 3;
let sheetData = [];

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
  currentFloor = 3; // 👈 СБРОС ЭТАЖА

  plan.data = blockId + ".svg";

  floorPanel.style.display = "block";
  backBtn.style.display = "block";

  initFloors(); // 👈 ОБНОВИТЬ ЭТАЖИ

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

    const fullId = blockId + "-" + currentFloor + "-" + flatId;
    const flatData = sheetData.find(item => item.flat_id === fullId);

    if (flatData && flatData.color) {
      flat.style.fill = flatData.color;
    }

    flat.onclick = function () {
      flats.forEach(id => {
        const f = svgDoc.getElementById(id);
        if (f) {
          f.style.stroke = "";
          f.style.strokeWidth = "";
        }
      });

      flat.style.stroke = "red";
      flat.style.strokeWidth = "3";

      const card = document.getElementById("flatCard");
      if (card) card.classList.add("show");

      document.getElementById("cardFlat").innerText = flatId;

      if (flatData) {
        document.getElementById("cardArea").innerText = (flatData.area || "-") + " м²";
        document.getElementById("cardStatus").innerText = flatData.status || "-";

        let client = flatData.client || "";
        if (!client || client === "." || client.trim() === "") {
          client = "свободно";
        }

        document.getElementById("cardClient").innerText = client;
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
      if (card) card.style.display = "none";

      initFloors();
      plan.data = currentBlock + ".svg?t=" + Date.now();
    };

    floorsContainer.appendChild(btn);
  }
}
backBtn.onclick = function () {
  currentBlock = null;
  plan.data = "blocks.svg";

  floorPanel.style.display = "none";
  backBtn.style.display = "none";

  const card = document.getElementById("flatCard");
  if (card) card.style.display = "none";

  floorsContainer.innerHTML = "";
};