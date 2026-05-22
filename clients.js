// =====================
// CLIENTS DATA
// =====================

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
// CLIENT STATE
// =====================

let currentClientProject = null;
let currentClientBlock = null;

// 🔥 ВОТ ЭТО ДОБАВЛЯЕМ
let currentClientRows = [];
let currentClientIndex = 0;
let selectedManager = "all";

// =====================
// CLIENT FUNCTIONS
// =====================

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

  <div id="clientsStats"></div>

  <div style="text-align:center; margin-top:30px;">

      <div class="menuBtn" onclick="selectClientProject('kush')">
        Куш
      </div>

      <div class="menuBtn" onclick="selectClientProject('gafurov')">
        Гафуров 2
      </div>

      <div class="menuBtn" onclick="selectClientProject('buston')">
        Бустон 2
      </div>

      <div class="menuBtn" onclick="selectClientProject('obj4')">
        14-15
      </div>

      <div class="menuBtn" onclick="selectClientProject('sholk')">
        Шолккомбинат
      </div>

      <div class="menuBtn" onclick="selectClientProject('nabiev')">
        Набиев
      </div>

      <div class="menuBtn" onclick="selectClientProject('mikro8')">
        8-й микрорайон
      </div>

      <div class="menuBtn" onclick="selectClientProject('mikro12')">
  12-й микрорайон
</div>

<div class="menuBtn" onclick="selectClientProject('mikro32')">
  32/2 микрорайон
</div>

<div class="menuBtn" onclick="selectClientProject('gaf1')">
  Гафуров 1
</div>

<div class="menuBtn" onclick="selectClientProject('mikro321')">
  32/1 микрорайон
</div>

<div class="menuBtn" onclick="selectClientProject('mikro20')">
  20 микрорайон
</div>

<div class="menuBtn" onclick="selectClientProject('buston1')">
  Бустон 1
</div>
    </div>
  `;
  const debtRows = clientsData.filter(item => {

  const d = (item["доллар"] || "")
    .toString()
    .trim();

  return d.startsWith("-");
});

const totalDollarDebt = debtRows.reduce((sum, item) => {

  const value = parseFloat(
    (item["доллар"] || "0")
      .toString()
      .replace(/\s/g, "")
      .replace(",", ".")
  );

  return sum + (isNaN(value) ? 0 : Math.abs(value));

}, 0);

const totalSomoniDebt = debtRows.reduce((sum, item) => {

  const value = parseFloat(
    (item["долг"] || "0")
      .toString()
      .replace(/\s/g, "")
      .replace(",", ".")
  );

  return sum + (isNaN(value) ? 0 : value);

}, 0);

let goodClients = 0;
  renderClientsStats("Все объекты", [

  {
    value: `-${Math.round(totalDollarDebt).toLocaleString()}$`,
    label: "Общий долг"
  },

  {
  value: `
    <span style="color:#ffcc00">
      ${debtRows.length}
    </span>
  `,
  label: "Должники",
  danger: true
},

  {
  value: `${Math.round(totalSomoniDebt).toLocaleString()} TJS`,
  label: "Остаток"
},

{
  value: `
    <span style="color:#ffcc00">
      ${Math.round(totalSomoniDebt).toLocaleString()}
    </span> TJS
  `,
  label: "Просрочено",
  danger: true
}

]);

  backBtn.style.display = "block";
}

window.openClients = openClients;

function selectClientProject(project) {

  currentClientProject = project;

    // обычные объекты
  currentLevel = "clients-blocks";

  renderClientBlocks();
}

window.selectClientProject = selectClientProject;

function renderClientFlats() {
 clientsScreen.innerHTML = `
  <div id="clientsStats"></div>
`;
const clientProjectNames = {
  kush: "Куш",
  gafurov: "Гафуров 2",
  buston: "Бустон 2",
  obj4: "14-15",
  sholk: "Шолккомбинат",
  nabiev: "Набиев",
  mikro8: "8-й микрорайон",
mikro12: "12-й микрорайон",
mikro32: "32/2 микрорайон",
gaf1: "Гафуров 1",
mikro321: "32/1 микрорайон",
mikro20: "20 микрорайон",
buston1: "Бустон 1",
};



  if (!isClientsLoaded) return;

  const container = document.createElement("div");
  container.style.textAlign = "center";
  container.style.marginTop = "5px";

  const projectMap = {
  "Куш": "kush",
  "Гафуров 2": "gafurov",
  "Бустон 2": "buston",
  "14-15": "obj4",
  "Шолккомбинат": "sholk",
  "Набиев": "nabiev",
  "8-й микрорайон": "mikro8",
 "12-й микрорайон": "mikro12",
 "32/2 микрорайон": "mikro32",
 "Гафуров 1": "gaf1",
 "32/1 микрорайон": "mikro321",
 "20 микрорайон": "mikro20",
 "Бустон 1": "buston1",
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
  const totalDollarDebt = rows.reduce((sum, item) => {

  const value = parseFloat(
    (item["доллар"] || "0")
      .toString()
      .replace(/\s/g, "")
      .replace(",", ".")
  );

  return sum + (isNaN(value) ? 0 : Math.abs(value));

}, 0);

const totalSomoniDebt = rows.reduce((sum, item) => {

  const value = parseFloat(
    (item["долг"] || "0")
      .toString()
      .replace(/\s/g, "")
      .replace(",", ".")
  );

  return sum + (isNaN(value) ? 0 : value);

}, 0);

renderClientsStats(

 `${clientProjectNames[currentClientProject] || currentClientProject}`,

  [
    {
  value: `-${Math.round(totalDollarDebt).toLocaleString()}$`,
  label: "Общий долг"
},


{
  value: `${Math.round(totalSomoniDebt).toLocaleString()} TJS`,
  label: "Остаток"
},
  ]
);


// =====================
// 📊 считаем менеджеров
// =====================
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

const filterToggle = document.createElement("div");

filterToggle.className = "managerDrawerBtn";

filterToggle.innerHTML = "☰";
console.log("DRAWER CREATED");

filterToggle.onclick = () => {

  filterBox.classList.toggle("open");

};

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
  const managerRows = rows.filter(item => {
  return (item["менеджер"] || "").trim() === name;
});

const goodClients = managerRows.filter(item => {

  const start = item["старт"];
  const startDate = parseDate(start);

  const normalized = {};

  Object.keys(item).forEach(k => {
    normalized[k.trim()] = item[k];
  });

  const paymentKeys = Object.keys(normalized)
    .filter(k => /^\d{2}\/\d{2}$/.test(k));

  const realMonths = startDate
    ? generateMonths(startDate, paymentKeys.length)
    : paymentKeys;

  const today = new Date();
  today.setHours(0,0,0,0);

  let hasLate = false;

  realMonths.forEach((m, index) => {

    const [month, year] = m.split("/");

    const cellDate =
      new Date(2000 + Number(year), Number(month) - 1, 1);

    const key = paymentKeys[index];
    const value = key ? normalized[key] : "";

    const cleanValue =
      Number(String(value).replace(/\s/g, "")) || 0;

    const payDay =
      startDate ? startDate.getDate() : 1;

    const isPastMonth =
      cellDate.getFullYear() < today.getFullYear() ||

      (
        cellDate.getFullYear() === today.getFullYear() &&
        cellDate.getMonth() < today.getMonth()
      );

    const isCurrentMonth =
      cellDate.getFullYear() === today.getFullYear() &&
      cellDate.getMonth() === today.getMonth();

    if (
      cleanValue <= 0 &&
      (
        isPastMonth ||
        (isCurrentMonth && today.getDate() >= payDay)
      )
    ) {
      hasLate = true;
    }

  });

  return !hasLate;

}).length;

btn.innerHTML =
  `👤 ${name} (<span style="color:#ffcc00">${managerCounts[name]}</span>/<span style="color:#00ff66">${goodClients}</span>)`;

  btn.onclick = () => {
    selectedManager = name;
    renderClientFlats();
  };

  filterBox.appendChild(btn);
});

// вставляем ПЕРЕД списком
container.appendChild(filterToggle);
console.log(filterToggle);

container.appendChild(filterBox);
// фильтр данных
const filteredRows = rows.filter(item => {
  const m = (item["менеджер"] || "").trim();

  if (selectedManager === "all") return true;

  return m === selectedManager;
});

// 🔥 сортировка по самому большому долгу
filteredRows.sort((a, b) => {

  const debtA = Math.abs(
    parseMoney(a["доллар"])
  );

  const debtB = Math.abs(
    parseMoney(b["доллар"])
  );

  return debtB - debtA;

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

clientsScreen.appendChild(container); // ← добавь это

}

function renderClientBlocks() {

  clientsScreen.innerHTML = `
    <div id="clientsStats"></div>
  `;
 const clientProjectNames = {
  kush: "Куш",
  gafurov: "Гафуров 2",
  buston: "Бустон 2",
  obj4: "14-15",
  sholk: "Шолккомбинат",
  nabiev: "Набиев",
  mikro8: "8-й микрорайон",
mikro12: "12-й микрорайон",
mikro32: "32/2 микрорайон",
gaf1: "Гафуров 1",
mikro321: "32/1 микрорайон",
mikro20: "20 микрорайон",
buston1: "Бустон 1",
};

const realProject = currentClientProject;

const projectRows = clientsData.filter(item => {

  const flatId = (item.flatId || item.flatID || "")
    .toString()
    .toLowerCase()
    .replace(/\s/g, "");

  return flatId.startsWith(projects[realProject].sheet.toLowerCase());
});

const debtRows = projectRows.filter(item => {
  const d = (item["доллар"] || "").toString().trim();
  return d.startsWith("-");
});

const totalDollarDebt = debtRows.reduce((sum, item) => {

  const value = parseFloat(
    (item["доллар"] || "0")
      .toString()
      .replace(/\s/g, "")
      .replace(",", ".")
  );

  return sum + (isNaN(value) ? 0 : Math.abs(value));

}, 0);

const totalSomoniDebt = debtRows.reduce((sum, item) => {

  const value = parseFloat(
    (item["долг"] || "0")
      .toString()
      .replace(/\s/g, "")
      .replace(",", ".")
  );

  return sum + (isNaN(value) ? 0 : value);

}, 0);

debtRows.forEach(item => {

  let hasYellow = false;

  const startDate =
  item["дата договора"] || item["дата"];

if (!startDate) return;

const realMonths = generateMonths(startDate);

  realMonths.forEach(month => {

    const paid = parseMoney(item[month]);

    const fix = parseMoney(item["фикс"]);

    if (paid > 0 && paid < fix) {
      hasYellow = true;
    }

  });

  if (!hasYellow) {
    goodClients++;
  }

});

const goodClients = debtRows.filter(item => {

  const start = item["старт"];
  const startDate = parseDate(start);

  const normalized = {};

  Object.keys(item).forEach(k => {
    normalized[k.trim()] = item[k];
  });

  const paymentKeys = Object.keys(normalized)
    .filter(k => /^\d{2}\/\d{2}$/.test(k));

  const realMonths = startDate
    ? generateMonths(startDate, paymentKeys.length)
    : paymentKeys;

  const today = new Date();
  today.setHours(0,0,0,0);

  let hasLate = false;

  realMonths.forEach((m, index) => {

    const [month, year] = m.split("/");

    const cellDate =
      new Date(2000 + Number(year), Number(month) - 1, 1);

    const key = paymentKeys[index];
    const value = key ? normalized[key] : "";

    const cleanValue =
      Number(String(value).replace(/\s/g, "")) || 0;

    const payDay =
      startDate ? startDate.getDate() : 1;

    const isPastMonth =
      cellDate.getFullYear() < today.getFullYear() ||

      (
        cellDate.getFullYear() === today.getFullYear() &&
        cellDate.getMonth() < today.getMonth()
      );

    const isCurrentMonth =
      cellDate.getFullYear() === today.getFullYear() &&
      cellDate.getMonth() === today.getMonth();

    if (
      cleanValue <= 0 &&
      (
        isPastMonth ||
        (isCurrentMonth && today.getDate() >= payDay)
      )
    ) {
      hasLate = true;
    }

  });

  return !hasLate;

}).length;

let overdueSomoni = 0;

debtRows.forEach(item => {

  const start = item["старт"];
  const startDate = parseDate(start);

  const fixed =
    parseMoney(item["фикс/сумм"] || 0);

  if (!fixed) return;

  const normalized = {};

  Object.keys(item).forEach(k => {
    normalized[k.trim()] = item[k];
  });

  const paymentKeys = Object.keys(normalized)
    .filter(k => /^\d{2}\/\d{2}$/.test(k));

  const realMonths = startDate
    ? generateMonths(startDate, paymentKeys.length)
    : paymentKeys;

  const today = new Date();
  today.setHours(0,0,0,0);

  let expected = 0;
  let paid = 0;

  realMonths.forEach((m, index) => {

    const [month, year] = m.split("/");

    const cellDate =
      new Date(2000 + Number(year), Number(month) - 1, 1);

    const key = paymentKeys[index];
    const value = key ? normalized[key] : "";

    const cleanValue =
      parseMoney(value || 0);

    const payDay =
      startDate ? startDate.getDate() : 1;

    const isPastMonth =
      cellDate.getFullYear() < today.getFullYear() ||

      (
        cellDate.getFullYear() === today.getFullYear() &&
        cellDate.getMonth() < today.getMonth()
      );

    const isCurrentMonth =
      cellDate.getFullYear() === today.getFullYear() &&
      cellDate.getMonth() === today.getMonth();

    if (
      isPastMonth ||
      (isCurrentMonth && today.getDate() >= payDay)
    ) {
      expected += fixed;
      paid += cleanValue;
    }

  });

  const overdue =
  Math.max(0, expected - paid);

const clientDebt = Math.abs(
  parseMoney(item["долг"] || 0)
);

// просрочка не может быть больше остатка
const realOverdue =
  Math.min(overdue, clientDebt);

overdueSomoni += realOverdue;

});

renderClientsStats(

`${clientProjectNames[currentClientProject] || currentClientProject} `,

[
  {
    value: `-${Math.round(totalDollarDebt).toLocaleString()}$`,
    label: "Общий долг"
  },

  {
  value: `
    <span style="color:#ffcc00">
      ${debtRows.length}
    </span>

    <span style="color:white">
      /
    </span>

    <span style="color:#00ff66">
      ${goodClients}
    </span>
  `,
  label: "Должники",
  danger: true
},

  {
    value: `${Math.round(totalSomoniDebt).toLocaleString()} TJS`,
    label: "Остаток"
  },

  {
  value: `
<span style="color:#ffcc00">
  ${Math.round(overdueSomoni).toLocaleString()}
</span> TJS
`,
  label: "Просрочено",
  danger: true
},

]

);
  

  const blocks =
    projects[currentClientProject]?.blocks || [];

  const blockNames =
    projects[currentClientProject]?.blockNames || [];

  const container = document.createElement("div");

  container.style.textAlign = "center";
  container.style.marginTop = "60px";

  blocks.forEach((block, index) => {

    const btn = document.createElement("div");

    btn.className = "menuBtn";

    btn.innerText =
      blockNames[index] || block.toUpperCase();

    btn.onclick = () => {

      currentClientBlock = block;

      currentLevel = "clients-flats";

      renderClientFlats();
    };

    container.appendChild(btn);

  });

  clientsScreen.appendChild(container);
}


function nextClient() {
  if (!currentClientRows.length) return;

  currentClientIndex++;

  if (currentClientIndex >= currentClientRows.length) {
    currentClientIndex = 0;
  }

  showClientDetails(currentClientRows[currentClientIndex]);
}

function prevClient() {

  if (!currentClientRows.length) return;

  currentClientIndex--;

  if (currentClientIndex < 0) {

    currentClientIndex =
      currentClientRows.length - 1;
  }

  showClientDetails(
    currentClientRows[currentClientIndex]
  );
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

const key = paymentKeys[index];
const value = key ? normalized[key] : "";

const cleanValue = Number(String(value).replace(/\s/g, "")) || 0;

let cls = "empty";

const payDay = startDate ? startDate.getDate() : 1;

const isPastMonth =
  cellDate.getFullYear() < today.getFullYear() ||
  (
    cellDate.getFullYear() === today.getFullYear() &&
    cellDate.getMonth() < today.getMonth()
  );

const isCurrentMonth =
  cellDate.getFullYear() === today.getFullYear() &&
  cellDate.getMonth() === today.getMonth();

if (cleanValue > 0) {
  cls = "paid";
}
else if (isPastMonth) {
  cls = "late";
}
else if (isCurrentMonth && today.getDate() >= payDay) {
  cls = "late";
}
else {
  cls = "empty";
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
  "buston": "Бустон 2",
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

window.nextClient = nextClient;
window.prevClient = prevClient;
window.showClientDetails = showClientDetails;

function renderClientsStats(title, stats) {

  const box =
    document.getElementById("clientsStats");

  if (!box) return;
 
 box.innerHTML = `

<div class="topStickyBar">

  <div class="statsTitle">
    ${title}
  </div>

</div>

<div class="statsGrid" style="margin-top:-10px;">

  ${stats.map(item => `

    <div class="kpiMini ${item.danger ? "danger" : ""}">

      <div class="kpiValue">
        ${item.value}
      </div>

      <div class="kpiLabel">
        ${item.label}
      </div>

    </div>

  `).join("")}

</div>
`;
}

let startY = 0;
let startX = 0;

document.addEventListener("touchstart", (e) => {
  if (currentLevel !== "client-flat") return;

  startY = e.touches[0].clientY;
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", (e) => {
  if (currentLevel !== "client-flat") return;

  const endY = e.changedTouches[0].clientY;
  const endX = e.changedTouches[0].clientX;

  const deltaX = startX - endX;
  const deltaY = startY - endY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 70) {
      goBack();
    }
  } else {
    if (deltaY > 50) {
      nextClient();
    }

    if (deltaY < -50) {
      prevClient();
    }
  }
});


