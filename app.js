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
function selectProject(project, el) {

  if (!projects[project]) {
    console.error("Нет проекта:", project);
    return;
  }

  currentProject = project;
  currentBlock = null;

  if (!projects[project].svg) {
    alert("Пока нет проекта");
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

  const blocks = ["b1","b2","b3","b4","b5","b6"];

  blocks.forEach(id => {
    const el = svg.getElementById(id);
    if (!el) return;

    el.style.cursor = "pointer";

    el.onclick = () => {

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