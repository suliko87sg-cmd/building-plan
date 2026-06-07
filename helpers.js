function parseDate(dateStr) {
  if (!dateStr) return null;

  const parts = dateStr.split(/[.,]/);
  return new Date(parts[2], parts[1] - 1, parts[0]);
}
function generateMonths(startDate, count = 24) {
  const months = [];

  let month = startDate.getMonth();
  let year = startDate.getFullYear();

  for (let i = 0; i < count; i++) {
    const m = String(month + 1).padStart(2, "0");
    const y = String(year).slice(2);

    months.push(`${m}/${y}`);

    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return months;
}

const normalize = val => String(val || "").trim().toLowerCase();

function parseMoney(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const cleaned = String(value)
    .replace(/\s/g, "")
    .replace(/,/g, "")
    .trim();

  const number = parseFloat(cleaned);

  return isNaN(number)
    ? 0
    : number;

}

 function formatMoney(value) {

  return Number(value || 0)
    .toLocaleString("en-US");
 } 

 function getCurrentSheetProject() {
  return projects[currentProject]?.sheet || currentProject;
 }

 function getBlockSvgFile(projectKey, blockId) {
  if (projectKey === "buston") return "buston" + blockId + ".svg";
  if (projectKey === "gafurov") return "gafurov" + blockId + ".svg";
  if (projectKey === "obj4") return "14-15" + blockId + ".svg";
  if (projectKey === "nabiev") return "nab1.svg";

  return blockId + ".svg";
}

 function findFlatRow(flatId) {
  return sheetData.find(item =>
    normalize(item.project) === normalize(getCurrentSheetProject()) &&
    normalize(item.block) === normalize(currentBlock) &&
    normalize(item.flat) === normalize(flatId) &&
    Number(item.floor) === Number(currentFloor)
  );
}

window.normalize = normalize;
window.parseMoney = parseMoney;
window.formatMoney = formatMoney;
window.parseDate = parseDate;
window.generateMonths = generateMonths;