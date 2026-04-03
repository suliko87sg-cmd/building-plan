// =====================
// СОСТОЯНИЕ
// =====================
let currentProject = "kush";
let currentBlock = null;

// =====================
// ЭЛЕМЕНТЫ
// =====================
const plan = document.getElementById("plan");
const backBtn = document.getElementById("backBtn");
const flatCard = document.getElementById("flatCard");

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

  if (!projects[project].svg) {
    alert("Пока нет проекта");
    return;
  }

  loadSVG(projects[project].svg);
}

// делаем функцию глобальной для onclick в HTML
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
// КОГДА SVG ЗАГРУЗИЛСЯ
// =====================
plan.onload = function () {
  const svg = plan.contentDocument;
  if (!svg) return;

  console.log("SVG загружен:", plan.data);

  // =====================
  // ЕСЛИ МЫ ВНУТРИ БЛОКА → РАБОТАЮТ КВАРТИРЫ
  // =====================
  if (currentBlock) {
    const flats = [
      "flat1", "flat2", "flat3", "flat4", "flat5",
      "flat6", "flat7", "flat8", "flat9", "flat10"
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
  // ЕСЛИ МЫ В ПРОЕКТЕ → РАБОТАЮТ БЛОКИ
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

  plan.data = "";

  setTimeout(() => {
    loadSVG(projects[currentProject].svg);
  }, 50);

  backBtn.style.display = "none";
};

// =====================
// КАРТОЧКА КВАРТИРЫ
// =====================
function showFlatCard(id) {
  console.log("ОТКРЫВАЕМ КАРТОЧКУ:", id);

  document.getElementById("cardContract").innerText = "№123";
  document.getElementById("cardArea").innerText = "65 м²";
  document.getElementById("cardClient").innerText = "Иванов";

  flatCard.classList.add("show");
}

function hideFlatCard() {
  flatCard.classList.remove("show");
}

window.showFlatCard = showFlatCard;