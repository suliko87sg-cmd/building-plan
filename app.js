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

// =====================
// ПРОЕКТЫ
// =====================
const projects = {
  kush: {
    name: "Куш",
    svg: "blocks.svg"
  },
  buston: {
    name: "Бустон",
    svg: "bustonblocks.svg"
  },
  gafurov: {
    name: "Гафуров",
    svg: "gafurovblocks.svg"
  },
  obj4: {
    name: "14-15",
    svg: null // пока нет
  }
};

// =====================
// ВЫБОР ПРОЕКТА
// =====================
function selectProject(project, el) {
  console.log("Проект:", project);

  currentProject = project;
  currentBlock = null;

  document.querySelectorAll('.project-card').forEach(card => {
    card.classList.remove('active');
  });
  el.classList.add('active');

  if (!projects[project].svg) {
    alert("Этот объект пока не готов");
    return;
  }

  loadSVG(projects[project].svg);
}

// =====================
// ЗАГРУЗКА SVG
// =====================
function loadSVG(src) {
  plan.data = "";

  setTimeout(() => {
    plan.data = src + "?t=" + Date.now();
  }, 50);
}

// =====================
// КОГДА SVG ЗАГРУЗИЛСЯ
// =====================
plan.onload = function () {
  const svg = plan.contentDocument;
  if (!svg) return;

  console.log("SVG загружен:", plan.data);

  // === БЛОКИ ===
  const blocks = ["b1","b2","b3","b4","b5","b6"];

  blocks.forEach(id => {
    const el = svg.getElementById(id);
    if (!el) return;

    el.style.cursor = "pointer";

    el.onclick = () => {
      console.log("Блок:", id);

      currentBlock = id;
      let fileName = id + ".svg";

if (currentProject === "buston") {
  fileName = "buston" + id + ".svg";
}

if (currentProject === "gafurov") {
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

  loadSVG(projects[currentProject].svg);

  backBtn.style.display = "none";
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