// =====================
// MONITORING
// =====================

let monitoringData = [];
let financeData = {};
let isMonitoringLoaded = false;

fetch("https://opensheet.elk.sh/1bgxMmcENfryGLng9KZwju8zsoQaHBco-aDTmNONlQ2s/монитор")
  .then(res => res.json())
  .then(data => {

    console.log("MONITORING LOADED:", data);

    console.log(data[0]);

   monitoringData =
  Array.isArray(data)
    ? data
    : (data.data || []);

data.forEach(item => {

  const key =
    String(item["объекты"] || "")
      .trim()
      .toLowerCase();

  const value =
    parseMoney(item["этажы"]);

  if (key) {
    financeData[key] = value;
  }

});

console.log("FINANCE:", financeData);

isMonitoringLoaded = true;
})
.catch(err =>
    console.error("Ошибка monitoring:", err)
  );
  // =====================
// МОНИТОРИНГ
// =====================
function checkMonitoringAccess() {

document.getElementById("passwordModal")
  .style.display = "flex";

}

function openMonitoring() {

  currentLevel = "monitoring";

  // скрываем всё
  mainMenu1.style.display = "none";
  mainMenu.style.display = "none";

  clientsScreen.style.display = "none";

  plan.style.display = "none";
  floorPanel.style.display = "none";

  hideFlatCard();

  // показываем мониторинг
  monitoringScreen.style.display = "block";

let totalSold = 0;
let totalPaid = 0;
let totalDebt = 0;
let totalProjectMeters = 0;
let totalSoldMeters = 0;

monitoringData.forEach(item => {

  totalSold += parseMoney(
    item["продано $"] || 0
  );

  totalPaid += parseMoney(
    item["оплачено $"] || 0
  );

  totalDebt += parseMoney(
    item[" остаток $"] || 0
  );

  totalProjectMeters += parseMoney(
  item["m² в проекте"] || 0
);

totalSoldMeters += parseMoney(
  item["m² в договоров"] || 0
);

});

let totalClientsDebt = 0;
let totalClients = 0;


  monitoringScreen.innerHTML = `

    <div class="monitoringHeader">
MONITORING
</div>

    <div class="monitoringGrid">

      <div class="monitorCard large" onclick="openSalesMonitoring()">
  <div class="monitorIcon">◫</div>
  <div class="monitorTitle">Продажи</div>
<div class="monitorSub">
${formatMoney(totalSold)} $
</div>
</div>

      <div class="monitorCard" onclick="openDebtMonitoring()">

  <div class="monitorIcon">◧</div>

  <div class="monitorTitle">Погашение</div>
<div class="monitorSub">
${formatMoney(totalPaid)} $
</div>

</div>

      <div class="monitorCard" onclick="openBuildMonitoring()">

  <div class="monitorIcon">△</div>

  <div class="monitorTitle">Стройка</div>

  <div class="monitorSub">
    ${formatMoney(totalProjectMeters)}
/
${formatMoney(totalSoldMeters)} м²
  </div>

</div>

      <div class="monitorCard wide" onclick="openManagersMonitoring()">
  <div class="monitorIcon">◎</div>
  <div class="monitorTitle">Менеджеры</div>
<div class="monitorSub">12 managers online</div>
</div>

      <div class="monitorCard" onclick="openFinanceMonitoring()">

  <div class="monitorIcon">▣</div>

  <div class="monitorTitle">Финансы</div>

  <div class="monitorSub">
    ${formatMoney(totalDebt)} $
  </div>

</div>

      <div class="monitorCard small danger" onclick="openProblemsMonitoring()">
        <div class="monitorIcon">✕</div>
        <div class="monitorTitle">Проблемы</div>
<div class="monitorSub">2 critical alerts</div>
      </div>

    </div>
  `;

  backBtn.style.display = "block";
}

window.openMonitoring = openMonitoring;

// =====================
// ПРОДАЖИ
// =====================

function openSalesMonitoring() {

  if (!isMonitoringLoaded) {
    alert("Мониторинг ещё загружается");
    return;
  }

  currentLevel = "sales-monitoring";

  let totalSold = 0;
  let totalPaid = 0;
  let totalDebt = 0;
  let totalProjectMeters = 0;
let totalSoldMeters = 0;

  monitoringData.forEach(item => {

  totalSold += parseMoney(
    item["продано $"] || 0
  );

  totalPaid += parseMoney(
    item["оплачено $"] || 0
  );

  totalDebt += parseMoney(
    item[" остаток $"] || 0
  );

  totalProjectMeters += parseMoney(
  item["m² в проекте"] || 0
);

totalSoldMeters += parseMoney(
  item["m² в договоров"] || 0
);
});

  monitoringScreen.innerHTML = `

    <div class="monitoringHeader">
      🏢 Продажи
    </div>

    <div class="kpiGrid">

      <div class="kpiCard">
        <div class="kpiLabel">Продано (шартнома шудаги)</div>
        <div class="kpiValue">
          ${formatMoney(totalSold)} $
        </div>
      </div>

      <div class="kpiCard">
        <div class="kpiLabel">Оплачено (чек доранд)</div>
        <div class="kpiValue">
          ${formatMoney(totalPaid)} $
        </div>
      </div>

      <div class="kpiCard danger">
        <div class="kpiLabel">Остаток (погашение)</div>
        <div class="kpiValue">
          ${formatMoney(totalDebt)} $
        </div>
      </div>

      <div class="kpiCard">
        <div class="kpiLabel">м² проект / договор</div>

<div class="kpiValue">

<span style="
font-size:18px;
white-space:nowrap;
">
  ${formatMoney(totalProjectMeters)}

  <span style="
    opacity:.4;
    margin:0 4px;
  ">
    /
  </span>

  <span style="
    color:#00ff88;
    font-weight:700;
  ">
    ${formatMoney(totalSoldMeters)}
  </span>

</span>

</div>
      </div>

    </div>

    <div id="projectsList"></div>
  `;

  const projectsList =
    document.getElementById("projectsList");

  monitoringData.forEach(item => {

    const name =
item["объекты"] || "Объект";

const sold =
parseMoney(item["продано $"] || 0);

const paid =
parseMoney(item["оплачено $"] || 0);

const avg =
item["среднее значение"] || "-";

const debt =
parseMoney(item[" остаток $"] || 0);

const projectMeters =
parseMoney(item["m² в проекте"] || 0);

const soldMeters =
parseMoney(item["m² в договоров"] || 0);

    projectsList.innerHTML += `

      <div class="projectMonitorCard">

        <div class="projectTop">
          🏗️ ${name}
        </div>

        <div class="projectStats">

          <div>
            Продано:
            <b>${formatMoney(sold)} $</b>
          </div>

          <div>
            Оплачено:
            <b>${formatMoney(paid)} $</b>
          </div>

          <div>
            Средний м²:
            <b>${avg}</b>
          </div>

          <div>
  м²:
  <b>
    ${formatMoney(projectMeters)}
  </b>

  /

  <b style="color:#00ff88;">
    ${formatMoney(soldMeters)}
  </b>
</div>

          <div>
            Остаток:
            <b>${formatMoney(debt)} $</b>
          </div>
        </div>

      </div>
    `;
  });
}

window.openSalesMonitoring =
  openSalesMonitoring;

  function openDebtMonitoring() {

  currentLevel = "debt-monitoring";
  let totalDebt = 0;
let totalClients = 0;

const projectStats = {};

let overdueTotal = 0;
let currentMonthPaid = 0;

const today = new Date();

const currentMonth =
  String(today.getMonth() + 1)
    .padStart(2, "0");

const currentYear =
  String(today.getFullYear())
    .slice(2);

const currentMonthKey =
  `${currentMonth}/${currentYear}`;

clientsData.forEach(item => {

  // 🔥 пропускаем мусорные строки
if (
  !item["клиент"] ||
  !item["договоры"] ||
  !(item["flatId"] || item["flatID"])
) {
  return;
}

  const dollar =
    parseMoney(item["доллар"]);

  // только должники
  if (dollar >= 0) return;

  const debt = Math.abs(dollar);

  // =====================
// ПРОСРОЧКА
// =====================

const start = item["старт"];
const startDate = parseDate(start);

const fixed =
  parseMoney(item["фикс/сумм"] || 0);
  let overdue = 0;
let realOverdue = 0;

if (startDate && fixed) {

  const normalized = {};

  Object.keys(item).forEach(k => {
    normalized[k.trim()] = item[k];
  });

  const paymentKeys = Object.keys(normalized)
    .filter(k => /^\d{2}\/\d{2}$/.test(k));

  const realMonths =
    generateMonths(startDate, paymentKeys.length);

  let expected = 0;
  let paid = 0;

  realMonths.forEach((m, index) => {

    const [month, year] = m.split("/");

    const cellDate =
      new Date(
        2000 + Number(year),
        Number(month) - 1,
        1
      );

    const key = paymentKeys[index];

    const value =
      key ? normalized[key] : "";

    const cleanValue =
      parseMoney(value || 0);

    const payDay =
      startDate.getDate();

    const isPastMonth =
      cellDate.getFullYear() <
        today.getFullYear()

      ||

      (
        cellDate.getFullYear() ===
          today.getFullYear()

        &&

        cellDate.getMonth() <
          today.getMonth()
      );

    const isCurrentMonth =
      cellDate.getFullYear() ===
        today.getFullYear()

      &&

      cellDate.getMonth() ===
        today.getMonth();

    if (
      isPastMonth ||

      (
        isCurrentMonth &&
        today.getDate() >= payDay
      )
    ) {

      expected += fixed;
      paid += cleanValue;

    }

  });

  overdue =
  Math.max(0, expected - paid);

// 🔥 ограничиваем просрочку остатком клиента
const clientDebt = Math.abs(
  parseMoney(item["долг"] || 0)
);

realOverdue =
  Math.min(overdue, clientDebt);

overdueTotal += realOverdue;
}

// =====================
// ОПЛАЧЕНО ЗА МЕСЯЦ
// =====================

const currentMonthValue =
  parseMoney(item[currentMonthKey] || 0);
 

currentMonthPaid += currentMonthValue;

  totalDebt += debt;

  totalClients++;

let project =
  (item["проект"] || "")
    .trim();

// 🔥 если проект пустой — берём из flatId
if (!project) {

  const flat =
    (item["flatId"] || item["flatID"] || "")
      .toLowerCase();

  if (flat.startsWith("32/1")) {
    project = "32/1";
  }

  else if (flat.startsWith("32/2")) {
    project = "32/2";
  }

  else if (flat.startsWith("20")) {
    project = "20-мкрн";
  }

  else if (flat.startsWith("8")) {
    project = "8В";
  }

  else {
    return; // 🔥 вообще пропускаем неизвестное
  }

}

// берём только первое слово
project = project.split(" ")[0];

  if (!projectStats[project]) {
   

    projectStats[project] = {
  debt: 0,
  clients: 0,
  overdue: 0
};

  }
   projectStats[project].overdue += realOverdue;

  projectStats[project].debt += debt;

  projectStats[project].clients++;

});
  monitoringScreen.innerHTML = `

    <div class="monitoringHeader">
      💸 Погашение
    </div>

    <div class="kpiGrid">

      <div class="kpiCard danger">
        <div class="kpiLabel">
          Общий долг
        </div>

        <div class="kpiValue">
          ${formatMoney(totalDebt)} $
        </div>
      </div>

      <div class="kpiCard">
        <div class="kpiLabel">
          Должников
        </div>

        <div class="kpiValue">
          ${totalClients}
        </div>
      </div>

      <div class="kpiCard">
        <div class="kpiLabel">
          Просрочка
        </div>

        <div class="kpiValue">
          ${formatMoney(overdueTotal)} TJS
        </div>
      </div>

      <div class="kpiCard">
        <div class="kpiLabel">
         
        </div>

        <div class="kpiValue">
           ${formatMoney(currentMonthPaid)} TJS
        </div>
      </div>

    </div>

    <div id="debtProjects"></div>
`;


  const debtProjects =
  document.getElementById("debtProjects");

Object.keys(projectStats).forEach(project => {

  const data = projectStats[project];

  debtProjects.innerHTML += `

    <div class="projectMonitorCard">

      <div class="projectTop">
        🏢 ${project}
      </div>

      <div class="projectStats">

        <div>
          Долг:
          <b>${formatMoney(data.debt)} $</b>
        </div>

        <div>
          Должников:
          <b>${data.clients}</b>
        </div>

        <div>
  Просрочка:
<b style="color:#ffcc00;">
  ${formatMoney(data.overdue)} TJS
</b>
</div>
      </div>

    </div>

  `;

});

}

window.openDebtMonitoring =
  openDebtMonitoring;

  // =====================
// СТРОЙКА
// =====================

function openBuildMonitoring() {

  currentLevel = "build-monitoring";

  monitoringScreen.innerHTML = `

    <div class="monitoringHeader">
      🏗️ Стройка
    </div>

    <div class="buildGrid">

      <div class="buildCard">

        <div class="buildTop">
          🏢 Куш
        </div>

        <div class="buildInfo">
          Этажей: 18
        </div>

        <div class="buildInfo">
          Квартир: 540
        </div>

        <div class="buildInfo">
          Готовность: 72%
        </div>

        <div class="progressBar">
          <div class="progressFill" style="width:72%"></div>
        </div>

      </div>

      <div class="buildCard">

        <div class="buildTop">
          🏢 Бустон
        </div>

        <div class="buildInfo">
          Этажей: 16
        </div>

        <div class="buildInfo">
          Квартир: 320
        </div>

        <div class="buildInfo">
          Готовность: 54%
        </div>

        <div class="progressBar">
          <div class="progressFill" style="width:54%"></div>
        </div>

      </div>

      <div class="buildCard">

        <div class="buildTop">
          🏢 Гафуров
        </div>

        <div class="buildInfo">
          Этажей: 14
        </div>

        <div class="buildInfo">
          Квартир: 210
        </div>

        <div class="buildInfo">
          Готовность: 81%
        </div>

        <div class="progressBar">
          <div class="progressFill" style="width:81%"></div>
        </div>

      </div>

    </div>
  `;
}

window.openBuildMonitoring =
  openBuildMonitoring;

  function openManagersMonitoring() {

  currentLevel = "managers-monitoring";

  monitoringScreen.innerHTML = `
<div class="monitoringHeader">
👔 Менеджеры
</div>

<div id="managersList"></div>
`;

const managersList =
document.getElementById("managersList");

const managers = {};

clientsData.forEach(item => {

  const manager =
  item["менеджер"] ||
  item["Менеджер"] ||
  item["manager"] ||
  item["кассир"] ||
  item["сотрудник"] ||
  "Неизвестно";

  if (!managers[manager]) {
    managers[manager] = {
      total: 0,
      active: 0,
      debt: 0
    };
  }

  managers[manager].total++;

  const rawDollar =
  parseMoney(item["доллар"] || 0);

const debt =
  Math.abs(rawDollar);

  managers[manager].debt += debt;

  if (rawDollar >= 0) {
  managers[manager].active++;
}
});

Object.entries(managers)
.forEach(([name, data]) => {

  managersList.innerHTML += `

  <div class="projectMonitorCard"
       onclick="openManagerDetails('${name}')">

    <div class="projectTop">
      👔 ${name}
    </div>

    <div class="projectStats">

      <div>
        Клиенты:
        <b>
          ${data.total}
          /
          <span style="color:#00ff88">
            ${data.active}
          </span>
        </b>
      </div>

      <div>
        Долг:
        <b>
          ${formatMoney(data.debt)} $
        </b>
      </div>

    </div>

  </div>
  `;
});

}

window.openManagersMonitoring =
openManagersMonitoring;


function openFinanceMonitoring() {

currentLevel = "finance-monitoring";

monitoringScreen.innerHTML = `

<div class="monitoringHeader">
📈 Финансы
</div>

<div class="kpiGrid">

<div class="kpiCard">
<div class="kpiLabel">Общий приход</div>
<div class="kpiValue">4 820 000 $</div>
</div>

<div class="kpiCard">
<div class="kpiLabel">Расход</div>
<div class="kpiValue">2 140 000 $</div>
</div>

<div class="kpiCard">
<div class="kpiLabel">Прибыль</div>
<div class="kpiValue">2 680 000 $</div>
</div>

<div class="kpiCard danger">
<div class="kpiLabel">Долги клиентов</div>
<div class="kpiValue">438 000 $</div>
</div>

</div>

<div class="projectMonitorCard">

<div class="projectTop">
💰 Касса компании
</div>

<div class="projectStats">
<div>Наличные: <b>320 000 $</b></div>
<div>На счетах: <b>1 480 000 $</b></div>
<div>Ожидается: <b>740 000 $</b></div>
</div>

</div>

<div class="projectMonitorCard">

<div class="projectTop">
🏗️ Подрядчики
</div>

<div class="projectStats">
<div>Оплачено: <b>1 240 000 $</b></div>
<div>Осталось: <b>380 000 $</b></div>
</div>

</div>

`;

}


window.openFinanceMonitoring =
openFinanceMonitoring;

function openProblemsMonitoring() {

currentLevel = "problems-monitoring";

monitoringScreen.innerHTML = `

<div class="monitoringHeader">
🚨 Проблемы
</div>

<div class="projectMonitorCard danger">

<div class="projectTop">
⚠️ Бустон
</div>

<div class="projectStats">
<div>Просрочка платежей: <b>148 000 $</b></div>
<div>Проблемных клиентов: <b>12</b></div>
<div>Задержка стройки: <b>3 дня</b></div>
</div>

</div>

<div class="projectMonitorCard danger">

<div class="projectTop">
⚠️ Гафуров
</div>

<div class="projectStats">
<div>Не хватает материалов</div>
<div>Долги подрядчикам: <b>42 000 $</b></div>
</div>

</div>

<div class="projectMonitorCard danger">

<div class="projectTop">
⚠️ Куш
</div>

<div class="projectStats">
<div>Просрочка клиентов: <b>61 000 $</b></div>
<div>Жалобы: <b>4</b></div>
</div>

</div>

`;

}

window.openProblemsMonitoring =
openProblemsMonitoring;


window.checkMonitoringAccess =
  checkMonitoringAccess;

  let enteredPin = "";

  function checkMonitoringPassword() {

  if (enteredPin === "00101") {

    document.getElementById("passwordModal")
      .style.display = "none";

    enteredPin = "";

    updatePinDots();

    openMonitoring();

  }

  else {

    alert("Неверный PIN");

    enteredPin = "";

    updatePinDots();

  }

}

function addPinNumber(number) {

  if (enteredPin.length >= 5) return;

  enteredPin += number;

  updatePinDots();

}

function removePinNumber() {

  enteredPin =
    enteredPin.slice(0, -1);

  updatePinDots();

}

function updatePinDots() {

  const dots =
    document.querySelectorAll(
      "#pinDots span"
    );

  dots.forEach((dot, index) => {

    dot.classList.toggle(
      "active",
      index < enteredPin.length
    );

  });

}

window.addPinNumber =
  addPinNumber;

window.removePinNumber =
  removePinNumber;
  

window.checkMonitoringPassword =
  checkMonitoringPassword;

  document
  .getElementById("passwordInput")
  .addEventListener("keydown", e => {

    if (e.key === "Enter") {

      checkMonitoringPassword();

    }

});