const xlsx = require('xlsx');
const wb = xlsx.readFile('database.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(wb);

console.log('Total rows:', data.length);
console.log('Keys:', Object.keys(data[0] || {}));
console.log('\nSample rows:');
for (let i = 0; i < Math.min(5, data.length); i++) {
  console.log(`\nRow ${i + 1}:`);
  console.log('  Год:', data[i]['Год']);
  console.log('  Контракт: дата:', data[i]['Контракт: дата']);
}

// Проверка уникальных годов
const years = new Set();
data.forEach(row => {
  let year = null;
  
  // Из столбца Год
  if (row['Год']) {
    if (typeof row['Год'] === 'object' && row['Год'].getFullYear) {
      year = row['Год'].getFullYear();
    } else {
      year = parseInt(row['Год']);
    }
  }
  
  if (!isNaN(year)) {
    years.add(year);
  }
});

console.log('\nУникальные годы из столбца "Год":', [...years].sort((a, b) => a - b));
