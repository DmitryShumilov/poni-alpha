const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'database.xlsx');
const workbook = xlsx.readFile(filePath, { cellDates: true });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });

console.log('Total rows (with header):', data.length);
const headers = data.shift();
console.log('Headers count:', headers?.length);
console.log('Header[26] (Год):', headers?.[26]);

// Проверка годов
const years = new Set();
console.log('\nПервые 10 строк:');
for (let i = 0; i < Math.min(10, data.length); i++) {
  const yearRaw = data[i]?.[26];
  let year = null;
  if (yearRaw !== undefined && yearRaw !== null) {
    if (typeof yearRaw === 'object' && yearRaw.getFullYear) {
      year = yearRaw.getFullYear();
    } else {
      year = parseInt(yearRaw);
    }
  }
  years.add(year);
  console.log(`Row ${i + 1}: yearRaw=`, yearRaw, '=> year=', year);
}

console.log('\nУникальные годы:', [...years].filter(y => y !== null).sort((a, b) => a - b));
console.log('Всего записей:', data.length);
