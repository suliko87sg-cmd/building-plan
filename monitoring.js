// =====================
// MONITORING
// =====================

let monitoringData = [];
let isMonitoringLoaded = false;

fetch("https://opensheet.elk.sh/1bgxMmcENfryGLng9KZwju8zsoQaHBco-aDTmNONlQ2s/monitoring_api")
  .then(res => res.json())
  .then(data => {

    console.log("MONITORING LOADED:", data);

    monitoringData =
      Array.isArray(data)
        ? data
        : (data.data || []);

    isMonitoringLoaded = true;

  })
  .catch(err =>
    console.error("Ошибка monitoring:", err)
  );
  // =====================
// МОНИТОРИНГ
// =====================
function checkMonitoringAccess() {

const pin = prompt("бе парол хта гам нате!");

if (pin === "00101") {

openMonitoring();

}

else if (pin !== null) {

alert("Неверный PIN-код");

}

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

  monitoringScreen.innerHTML = `

    <div class="monitoringHeader">
MONITORING
</div>

    <div class="monitoringGrid">

      <div class="monitorCard large" onclick="openSalesMonitoring()">
  <div class="monitorIcon">◫</div>
  <div class="monitorTitle">Продажи</div>
<div class="monitorSub">$2.4M this month</div>
</div>

      <div class="monitorCard" onclick="openDebtMonitoring()">

  <div class="monitorIcon">◧</div>

  <div class="monitorTitle">Погашение</div>
<div class="monitorSub">38 active debtors</div>

</div>

      <div class="monitorCard" onclick="openBuildMonitoring()">

  <div class="monitorIcon">△</div>

  <div class="monitorTitle">Стройка</div>
<div class="monitorSub">5 active projects</div>

</div>

      <div class="monitorCard wide" onclick="openManagersMonitoring()">
  <div class="monitorIcon">◎</div>
  <div class="monitorTitle">Менеджеры</div>
<div class="monitorSub">12 managers online</div>
</div>

      <div class="monitorCard" onclick="openFinanceMonitoring()">
  <div class="monitorIcon">▣</div>
  <div class="monitorTitle">Финансы</div>
<div class="monitorSub">Cashflow & reports</div>
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
  let totalMeters = 0;

  monitoringData.forEach(item => {

  totalSold += parseMoney(
    item["проданные"] || 0
  );

  totalPaid += parseMoney(
    item["оплачено"] || 0
  );

  totalDebt += parseMoney(
    item["остаток"] || 0
  );

  totalMeters += parseMoney(
    item["м² на данный момент продано"] || 0
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
        <div class="kpiLabel">Продано м²</div>
        <div class="kpiValue">
          ${formatMoney(totalMeters)}
        </div>
      </div>

    </div>

    <div id="projectsList"></div>
  `;

  const projectsList =
    document.getElementById("projectsList");

  monitoringData.forEach(item => {

    const name =
  item["обекты"] || "Объект";

const sold =
  parseMoney(item["проданные"] || 0);

const paid =
  parseMoney(item["оплачено"] || 0);

const avg =
  item["среднее значение"] || "-";

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

clientsData.forEach(item => {

  const dollar =
    parseMoney(item["доллар"]);

  // только должники
  if (dollar >= 0) return;

  const debt = Math.abs(dollar);

  totalDebt += debt;

  totalClients++;

  const fullProject =
  (item["проект"] || "Без проекта")
    .trim();

const project =
  fullProject.split(" ")[0];

  if (!projectStats[project]) {

    projectStats[project] = {
      debt: 0,
      clients: 0
    };

  }

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
          0 $
        </div>
      </div>

      <div class="kpiCard">
        <div class="kpiLabel">
          Оплачено за месяц
        </div>

        <div class="kpiValue">
          0 $
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

    <div class="projectMonitorCard">
      <div class="projectTop">
        👔 Ибрагим
      </div>

      <div class="projectStats">
        <div>Продаж: <b>14</b></div>
        <div>Сумма: <b>420 000 $</b></div>
        <div>Долги: <b>38 000 $</b></div>
      </div>
    </div>

    <div class="projectMonitorCard">
      <div class="projectTop">
        👔 Сафар
      </div>

      <div class="projectStats">
        <div>Продаж: <b>8</b></div>
        <div>Сумма: <b>210 000 $</b></div>
        <div>Долги: <b>12 000 $</b></div>
      </div>
    </div>

  `;

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