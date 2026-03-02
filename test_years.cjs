const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'database.xlsx');
const workbook = xlsx.readFile(filePath, { cellDates: true });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });

data.shift(); // Удаляем заголовок

// Проверка годов в разных частях файла
const checkRows = [1, 100, 200, 500, 1000, 1500, 1800];
console.log('Проверка годов по строкам:');
for (const rowIdx of checkRows) {
  if (rowIdx <= data.length) {
    const yearRaw = data[rowIdx]?.[26];
    let year = null;
    if (yearRaw !== undefined && yearRaw !== null) {
      if (typeof yearRaw === 'object' && yearRaw.getFullYear) {
        year = yearRaw.getFullYear();
      } else {
        year = parseInt(yearRaw);
      }
    }
    console.log(`Row ${rowIdx + 1}: year=`, year);
  }
}

// Все уникальные годы
const years = new Set();
for (let i = 0; i < data.length; i++) {
  const yearRaw = data[i]?.[26];
  if (yearRaw !== undefined && yearRaw !== null) {
    let year;
    if (typeof yearRaw === 'object' && yearRaw.getFullYear) {
      year = yearRaw.getFullYear();
    } else {
      year = parseInt(yearRaw);
    }
    if (!isNaN(year)) {
      years.add(year);
    }
  }
}

console.log('\nУникальные годы:', [...years].sort((a, b) => a - b));
