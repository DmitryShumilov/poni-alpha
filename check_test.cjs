const xlsx = require('xlsx');
const wb = xlsx.readFile('database_test.xlsx');
console.log('Sheet names:', wb.SheetNames);
const ws = wb.Sheets[wb.SheetNames[0]];

// Чтение с заголовками
const data = xlsx.utils.sheet_to_json(wb);
console.log('Total rows:', data.length);
console.log('Keys:', Object.keys(data[0] || {}));

// Проверка года
console.log('\n=== Проверка года ===');
for (let i = 0; i < Math.min(5, data.length); i++) {
  console.log(`Row ${i}: Год=${data[i]['Год']}, Контракт: дата=${data[i]['Контракт: дата']}`);
}

// Уникальные годы
const years = new Set();
data.forEach(row => {
  if (row['Год'] !== undefined) {
    const year = typeof row['Год'] === 'object' && row['Год'].getFullYear 
      ? row['Год'].getFullYear() 
      : parseInt(row['Год']);
    if (!isNaN(year)) years.add(year);
  }
});
console.log('\nУникальные годы:', [...years].sort((a, b) => a - b));
