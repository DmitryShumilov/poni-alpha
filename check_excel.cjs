const xlsx = require('xlsx');
const wb = xlsx.readFile('database.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];

// Чтение с заголовками
const dataWithHeaders = xlsx.utils.sheet_to_json(wb);
console.log('=== С заголовками ===');
console.log('Keys:', Object.keys(dataWithHeaders[0] || {}));
console.log('Row 1 "Год":', dataWithHeaders[0]?.['Год']);
console.log('Row 1 "Год" (type):', typeof dataWithHeaders[0]?.['Год']);

// Чтение по индексам (без заголовков)
const dataNoHeaders = xlsx.utils.sheet_to_json(wb, {header: 1});
console.log('\n=== Без заголовков (по индексам) ===');
console.log('Header row:', dataNoHeaders[0]);
console.log('Row 1, col 26:', dataNoHeaders[1]?.[26]);
console.log('Row 2, col 26:', dataNoHeaders[2]?.[26]);
console.log('Row 100, col 26:', dataNoHeaders[100]?.[26]);
console.log('Row 500, col 26:', dataNoHeaders[500]?.[26]);
console.log('Row 1000, col 26:', dataNoHeaders[1000]?.[26]);

// Проверка уникальных годов
const years = new Set();
for (let i = 1; i < dataNoHeaders.length; i++) {
  const year = dataNoHeaders[i]?.[26];
  if (year !== undefined && year !== null) {
    years.add(typeof year === 'object' && year.getFullYear ? year.getFullYear() : parseInt(year));
  }
}
console.log('\nУникальные годы:', [...years].sort((a, b) => a - b));
